import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const OPENAI_LLM_MODEL = "gpt-4o-mini"; // Modèle GPT-4o mini
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// --- Validation de la configuration ---
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("SUPABASE_URL et SUPABASE_KEY doivent être définis dans les variables d'environnement");
}
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY doit être défini dans les variables d'environnement");
}

// --- Initialisation des clients ---
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Types et Schémas ---
const QueryRequestSchema = z.object({
  question: z.string().min(1, "La question ne peut pas être vide."),
  threshold: z.number().min(0).max(1).default(0.45),
  k: z.number().int().positive().default(5),
  qualificationContext: z.string().optional(),
});

interface MatchDocumentResult {
  id: number;
  content: string;
  metadata: Record<string, unknown> | string;
  similarity: number;
}

// --- Fonctions Logiques ---
async function getOpenAIEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Erreur lors de la génération de l'embedding OpenAI:", error);
    throw new Error(`Erreur embedding OpenAI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function searchSimilarDocsSupabase(
  queryEmbedding: number[],
  k: number,
  threshold: number
): Promise<MatchDocumentResult[]> {
  if (!queryEmbedding || queryEmbedding.length === 0) {
    console.error("Erreur: L'embedding de la requête est vide.");
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: k,
    });

    if (error) {
      console.error("Erreur lors de l'appel RPC 'match_documents':", error);
      throw new Error(`Erreur recherche Supabase RPC: ${error.message}`);
    }

    console.log(`Nombre de documents similaires trouvés via Supabase: ${data?.length ?? 0}`);
    return data || [];
  } catch (error) {
    console.error("Exception lors de la recherche Supabase:", error);
    throw new Error(`Exception recherche Supabase: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function formatContextFromSupabase(results: MatchDocumentResult[]): { context: string; sources: string[] } {
  let context = "";
  const sourcesSet = new Set<string>();

  if (!results || results.length === 0) {
    return { context: "Aucun contexte pertinent trouvé dans la base de données.", sources: [] };
  }

  results.forEach(doc => {
    try {
      let metadata: Record<string, unknown> = {};
      if (typeof doc.metadata === 'string') {
        try {
          metadata = JSON.parse(doc.metadata);
        } catch (jsonError) {
          console.warn(`Erreur de décodage JSON pour les métadonnées du document ID ${doc.id}:`, jsonError);
          metadata = { url: 'N/A', title: 'N/A (Erreur Metadata)' };
        }
      } else if (typeof doc.metadata === 'object' && doc.metadata !== null) {
        metadata = doc.metadata;
      }

      // Extraire l'URL et s'assurer que c'est une chaîne
      const urlValue = metadata?.url;
      let url: string; // Déclarer explicitement comme string
      if (typeof urlValue === 'string' && urlValue.trim() !== '') {
        url = urlValue;
      } else {
        url = 'N/A';
      }

      const titleValue = metadata?.title; // Faire de même pour le titre par cohérence
      let title: string;
      if (typeof titleValue === 'string' && titleValue.trim() !== '') {
        title = titleValue;
      } else {
        title = 'N/A';
      }
      
      const content = doc.content || 'N/A';
      const similarity = typeof doc.similarity === 'number' ? doc.similarity : 0.0; // Assurer que similarity est un nombre

      context += `Source URL: ${url}\nTitre: ${title}\nContenu (similarité: ${similarity.toFixed(4)}): ${content}\n\n---\n\n`;
      if (url !== 'N/A') {
        sourcesSet.add(url); // url est maintenant garanti d'être une string
      }
    } catch (e) {
      console.error(`Erreur lors du formatage du document ID ${doc.id} depuis Supabase:`, e);
    }
  });

  const uniqueSources = Array.from(sourcesSet).sort();
  return { context: context.trim(), sources: uniqueSources };
}

// Fonction qui utilise OpenAI pour générer une réponse
async function queryOpenAIWithContext(
  retrievedContext: string,
  question: string,
  sources: string[],
  qualificationContext?: string
): Promise<string> {
  try {
    const prompt = `Tu es un assistant expert et méticuleux spécialisé sur les informations du site Ameli.fr de l'Assurance Maladie. Ton objectif est de fournir des réponses précises et détaillées basées *exclusivement* sur le contexte fourni (documents récupérés et profil utilisateur).

    **Instructions pour la réponse :**
    1.  **Analyse Combinée :** Examine attentivement l'intégralité des contextes ci-dessous (documents récupérés ET contexte de qualification utilisateur).
    2.  **Réponse Détaillée et Pertinente :** Formule une réponse complète et précise à la question de l'utilisateur. Utilise **uniquement** les informations des documents récupérés. Si le contexte de qualification utilisateur t'aide à mieux cerner la pertinence ou le niveau de détail nécessaire, adapte ta réponse en conséquence, mais ne te base que sur les documents pour les faits.
    3.  **Structure Claire :** Organise ta réponse logiquement (listes, gras...). 
    4.  **Gestion de l'Information Manquante :** Si les documents récupérés ne contiennent pas l'info, indique-le clairement : "D'après les documents fournis, je ne trouve pas de détails précis concernant [question]." N'utilise JAMAIS de connaissances externes.
    5.  **Sources Obligatoires :** À la fin, ajoute ## Sources et liste les URLs des documents *récupérés* utilisés. Si aucun document n'a été utilisé, indique "Aucune source pertinente utilisée.".

    **Contexte de Qualification Utilisateur :**
    ---------------------
    ${qualificationContext || "Non fourni."}
    ---------------------

    **Documents Récupérés :**
    ---------------------
    ${retrievedContext || "Aucun document pertinent trouvé dans la base de données."}
    ---------------------

    **Liste des URLs sources potentielles des documents :**
    ${sources.length > 0 ? sources.map(s => `- ${s}`).join('\n') : "Aucune source disponible"}
    ---------------------

    **Question de l'utilisateur :** ${question}
    
    **Réponse détaillée, structurée et pertinente :**`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 5000,
    });

    // Vérification que la réponse existe et n'est pas vide
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent || responseContent.trim() === "") {
      console.error("La réponse générée par OpenAI est vide");
      return "Je n'ai pas pu générer une réponse pour votre question. Voici toutefois les sources qui pourraient vous être utiles.";
    }

    return responseContent;
  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    // Renvoyer un message d'erreur avec les sources quand même
    if (sources && sources.length > 0) {
      return `Je suis désolé, je n'ai pas pu générer une réponse complète à votre question, mais voici des sources pertinentes qui pourraient contenir l'information que vous cherchez.\n\n## Sources\n${sources.map(s => `- ${s}`).join('\n')}`;
    }
    throw new Error(`Erreur OpenAI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// --- Handler POST de l'API Route ---
export async function POST(req: NextRequest) {
  try {
    // Vérification des variables d'environnement
    console.log("Variables d'environnement configurées : ", {
      OPENAI_API_KEY: !!OPENAI_API_KEY,
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_KEY: !!SUPABASE_KEY
    });

    // 1. Parser et valider la requête
    const rawBody = await req.json();
    const validationResult = QueryRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Requête invalide", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { question, threshold, k, qualificationContext } = validationResult.data;
    console.log(`Requête reçue : question='${question}', threshold=${threshold}, k=${k}`);
    if (qualificationContext) {
      console.log(`Contexte de qualification reçu: \n${qualificationContext}`);
    }

    // 2. Générer l'embedding
    console.log("Génération de l'embedding...");
    const queryEmbedding = await getOpenAIEmbedding(question);

    // 3. Rechercher les documents similaires
    console.log("Recherche des documents similaires...");
    const similarDocsResults = await searchSimilarDocsSupabase(
      queryEmbedding,
      k,
      threshold
    );

    // 4. Formater le contexte des documents récupérés
    console.log("Formatage du contexte récupéré...");
    const { context: retrievedContext, sources } = formatContextFromSupabase(similarDocsResults);

    if (!similarDocsResults || similarDocsResults.length === 0) {
      console.log("Aucun document similaire trouvé.");
    }

    // 5. Générer une réponse avec OpenAI
    console.log("Appel à OpenAI pour générer la réponse...");
    const answer = await queryOpenAIWithContext(
      retrievedContext, 
      question, 
      sources, 
      qualificationContext
    );

    console.log("Réponse générée.");
    // 6. Retourner la réponse
    return NextResponse.json({ answer, sources });

  } catch (error: unknown) {
    // Gérer les erreurs
    console.error("Erreur globale dans /api/rag:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: errorMessage },
      { status: 500 }
    );
  }
}

// Route GET pour tester l'accessibilité de l'API
export async function GET() {
  return NextResponse.json({ message: "API Route rag accessible (GET)" });
} 