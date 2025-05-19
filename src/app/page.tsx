"use client"

import type React from "react"

import Image from "next/image"
import { Sparkles, Check, Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Step = "initial" | "intro" | "documents" | "birthdate" | "dashboard" | "login" | "register"
type UserRole = "accompagnant" | "accompagne" | null

// Nouveaux types pour l'historique
export type HistoryEntryType =
  | "category_selection"
  | "qualification_step"
  | "user_query"
  | "assistant_reply";

interface BaseHistoryItem {
  id: string;
  type: HistoryEntryType;
  timestamp: Date;
}

interface CategorySelectionHistoryItem extends BaseHistoryItem {
  type: "category_selection";
  data: {
    categoryTitle: string;
    categoryIcon?: string | { src: string; alt: string }; // Pour gérer les deux types d'icônes
  };
}

interface QualificationStepHistoryItem extends BaseHistoryItem {
  type: "qualification_step";
  data: {
    questionText: string;
    answerText: string;
    answerIcon?: string; // L'icône du bouton de réponse (ex: 👍)
  };
}

interface UserQueryHistoryItem extends BaseHistoryItem {
  type: "user_query";
  data: {
    queryText: string;
    isSuggestion?: boolean; // Pour différencier les questions tapées des suggestions cliquées
    suggestionIcon?: string; // Icône de la suggestion si applicable
  };
}

interface AssistantReplyHistoryItem extends BaseHistoryItem {
  type: "assistant_reply";
  data: {
    replyText: string; // Le contenu Markdown de la réponse
  };
}

export type HistoryItem = 
  | CategorySelectionHistoryItem 
  | QualificationStepHistoryItem 
  | UserQueryHistoryItem 
  | AssistantReplyHistoryItem;

interface Document {
  id: string
  label: string
}

interface Category {
  id: string
  icon: string | { src: string; alt: string }
  title: string
  description: string
}

interface Message {
  id: string
  sender: "user" | "assistant"
  content: string
  timestamp: Date
  showButtons?: boolean
  buttons?: {
    id: string
    label: string
    icon?: string
  }[]
  showSuggestions?: boolean
  suggestions?: {
    id: string
    label: string
    icon?: string
  }[]
}

interface Question {
  id: string
  question: string
  buttons: {
    id: string
    label: string
    icon?: string
  }[]
  historyLabel: (answerId: string) => string
  historyIcon?: string
}

// Nouvelle interface pour une conversation individuelle
interface ConversationSessionData {
  messages: Message[];
  history: HistoryItem[]; 
  currentStep: Step;
  userRole: UserRole;
  selectedCategory: string | null;
  userAnswers: Record<string, string>;
  currentQuestionIndex: number;
  email: string; // Email de la session de connexion (si pertinent pour cette conv)
  birthdate: string; // Date de naissance de la session (si pertinent pour cette conv)
  // Les erreurs (loginError, registerError, etc.) sont transitoires et ne sont pas stockées par conversation
}

interface Conversation {
  id: string;
  name: string;
  lastActivity: number; // Timestamp numérique pour le tri
  sessionData: ConversationSessionData;
}

// Nouvelle structure pour localStorage
interface AppStorage {
  conversations: Conversation[];
  activeConversationId: string | null;
}

// Clé localStorage mise à jour
const APP_STORAGE_KEY = "triptekAssistantSessions_v2"; // v2 pour indiquer la nouvelle structure

// Helper function to format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Styles pour les composants Markdown
const markdownComponents = {
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-lg font-semibold mt-6 pt-3 border-t border-gray-200 mb-2" {...props} />,
  ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
  ol: ({ ...props }: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-outside ml-5 space-y-1 my-2" {...props} />,
  li: ({ ...props }: React.HTMLAttributes<HTMLLIElement>) => <li className="pl-2 mb-1" {...props} />,
  p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-2" {...props} />,
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => <strong className="font-medium" {...props} />,
}

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("initial")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loginError, setLoginError] = useState<string>("")
  const [registerEmail, setRegisterEmail] = useState<string>("")
  const [registerPassword, setRegisterPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [registerError, setRegisterError] = useState<string>("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [birthdate, setBirthdate] = useState<string>("")
  const [birthdateError, setBirthdateError] = useState<string>("")
  const [question, setQuestion] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Nouveaux états pour gérer plusieurs conversations
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Nouveaux états pour la modale de confirmation de suppression
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);

  // Helper pour générer un nom de conversation par défaut
  const generateDefaultConversationName = (currentMessages: Message[]): string => {
    const firstUserMessage = currentMessages.find(m => m.sender === 'user')
    if (firstUserMessage && firstUserMessage.content.trim()) {
      return firstUserMessage.content.trim().substring(0, 30) + (firstUserMessage.content.trim().length > 30 ? "..." : "")
    }
    return "Nouvelle conversation"
  }

  // Effet pour charger l'état depuis localStorage au montage initial
  useEffect(() => {
    const savedStorage = localStorage.getItem(APP_STORAGE_KEY)
    if (savedStorage) {
      try {
        const parsedStorage: AppStorage = JSON.parse(savedStorage)
        if (parsedStorage.conversations) {
          const loadedConversations = parsedStorage.conversations.map(conv => ({
            ...conv,
            sessionData: {
              ...conv.sessionData,
              messages: conv.sessionData.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
              history: conv.sessionData.history.map(item => ({ ...item, timestamp: new Date(item.timestamp) })),
            }
          }))
          setAllConversations(loadedConversations)

          let convIdToLoad = parsedStorage.activeConversationId
          if (!convIdToLoad && loadedConversations.length > 0) {
            // Charger la plus récente si aucun ID actif n'est sauvegardé
            convIdToLoad = loadedConversations.sort((a, b) => b.lastActivity - a.lastActivity)[0].id
          }
          
          if (convIdToLoad) {
            const activeConv = loadedConversations.find(c => c.id === convIdToLoad)
            if (activeConv) {
              // Charger les données de la session active
              const { sessionData } = activeConv
              setMessages(sessionData.messages)
              setHistory(sessionData.history)
              setCurrentStep(sessionData.currentStep)
              setUserRole(sessionData.userRole)
              setSelectedCategory(sessionData.selectedCategory)
              setUserAnswers(sessionData.userAnswers)
              setCurrentQuestionIndex(sessionData.currentQuestionIndex)
              setEmail(sessionData.email)
              setBirthdate(sessionData.birthdate)
              setActiveConversationId(activeConv.id)
            } else { // Si l'ID actif n'est pas trouvé, démarrer une nouvelle conversation
              createNewConversation(loadedConversations, true) 
            }
          } else { // Aucune conversation, en créer une nouvelle
            createNewConversation([], true) 
          }
        } else { // Pas de conversations dans le storage, en créer une nouvelle
           createNewConversation([], true) 
        }
      } catch (error) {
        console.error("Erreur lors de la restauration des sessions depuis localStorage:", error)
        localStorage.removeItem(APP_STORAGE_KEY) // Supprimer les données corrompues
        createNewConversation([], true) // Démarrer avec une nouvelle conversation propre
      }
    } else { // Pas de storage, en créer une nouvelle
      createNewConversation([], true) 
    }
  }, []) // Exécuter une seule fois au montage

  // Effet pour sauvegarder l'état dans localStorage lors de changements
  useEffect(() => {
    if (!activeConversationId && allConversations.length === 0 && messages.length === 0) {
        // Ne pas sauvegarder si tout est vide et qu'aucune conversation active n'est définie (état initial avant création)
        return
    }
    if(activeConversationId) { // Sauvegarder seulement si une conversation est active
        const currentConversationData: ConversationSessionData = {
            messages,
            history,
            currentStep,
            userRole,
            selectedCategory,
            userAnswers,
            currentQuestionIndex,
            email,
            birthdate,
        }

        const updatedConversations = allConversations.map(conv => 
            conv.id === activeConversationId 
            ? { 
                ...conv, 
                sessionData: currentConversationData, 
                lastActivity: Date.now(), 
                name: conv.name === "Nouvelle conversation" && messages.length > 0 ? generateDefaultConversationName(messages) : conv.name 
              } 
            : conv
        )
        
        // S'assurer que la conversation active est bien dans la liste (au cas où elle vient d'être créée)
        if (!updatedConversations.some(c => c.id === activeConversationId)) {
            // Ce cas devrait être géré par createNewConversation, mais sécurité
            const newConv: Conversation = {
                id: activeConversationId,
                name: generateDefaultConversationName(messages),
                lastActivity: Date.now(),
                sessionData: currentConversationData
            }
            updatedConversations.push(newConv)
        }

        setAllConversations(updatedConversations) // Mettre à jour l'état local des conversations

        const newStorage: AppStorage = {
            conversations: updatedConversations,
            activeConversationId,
        }
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newStorage))
    }
  }, [
    messages, history, currentStep, userRole, selectedCategory, userAnswers, 
    currentQuestionIndex, email, birthdate, activeConversationId, allConversations // Ajout de allConversations
  ])


  const createNewConversation = (currentListOfConversations: Conversation[], isInitialLoad = false) => {
    const newConversationId = `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      name: "Nouvelle conversation",
      lastActivity: Date.now(),
      sessionData: {
        messages: [],
        history: [],
        currentStep: "dashboard", // Démarrer directement sur le dashboard
        userRole: null, // Rôle non défini pour une nouvelle conversation
        selectedCategory: null, // Aucune catégorie sélectionnée au début
        userAnswers: {},
        currentQuestionIndex: 0,
        email: "",
        birthdate: "",
      },
    };

    const updatedListOfConversations = [...currentListOfConversations, newConversation];
    if (!isInitialLoad) { 
        setAllConversations(updatedListOfConversations);
    } else {
        // Pour le chargement initial, si on crée une nouvelle conv, il faut aussi mettre à jour allConversations
        // Ceci est important si le localStorage était vide ou corrompu.
        setAllConversations(updatedListOfConversations); 
    }
    
    // Charger les états de la nouvelle conversation
    setMessages(newConversation.sessionData.messages);
    setHistory(newConversation.sessionData.history);
    setCurrentStep(newConversation.sessionData.currentStep); // Sera "dashboard"
    setUserRole(newConversation.sessionData.userRole);
    setSelectedCategory(newConversation.sessionData.selectedCategory); // Sera null
    setUserAnswers(newConversation.sessionData.userAnswers);
    setCurrentQuestionIndex(newConversation.sessionData.currentQuestionIndex);
    setEmail(newConversation.sessionData.email);
    setBirthdate(newConversation.sessionData.birthdate);
    // Réinitialiser les champs de formulaire temporaires
    setQuestion("");
    setPassword("");
    setLoginError("");
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
    setRegisterError("");
    setSelectedDocuments([]);
    setBirthdateError("");

    setActiveConversationId(newConversationId);
    return newConversationId; // Retourner l'ID pour le chargement initial
  }

  const handleGoHome = () => {
    const newConvId = createNewConversation(allConversations);
    // Après création, forcer l'étape initiale si c'est un vrai "Go Home"
    // Essayer de trouver la conversation dans la liste actuelle (elle devrait y être si createNewConversation l'a ajoutée)
    const convToUpdate = allConversations.find(c => c.id === newConvId);

    // Si elle n'est pas trouvée (ce qui pourrait arriver si createNewConversation est modifiée pour ne pas setter allConversations immédiatement
    // ou si la liste passée à createNewConversation n'était pas la plus à jour), on la crée et on la récupère.
    // Cependant, avec la logique actuelle, createNewConversation met à jour setAllConversations (sauf si isInitialLoad est true et qu'on est pas dans le useEffect de load)
    // Pour simplifier, on part du principe que createNewConversation a bien mis à jour allConversations OU que l'ID est valide pour une nouvelle création.
    
    // Pour handleGoHome, on veut une nouvelle conversation configurée pour commencer à l'étape "initial"
    const goHomeSessionData: ConversationSessionData = {
        messages: [], history: [], currentStep: "initial", userRole: null, selectedCategory: null,
        userAnswers: {}, currentQuestionIndex: 0, email: "", birthdate: "",
    };

    if (convToUpdate) { // Si la conversation a été trouvée (donc ajoutée par createNewConversation)
        const updatedConv = { 
            ...convToUpdate, 
            sessionData: goHomeSessionData,
            name: "Nouvelle conversation" // Réinitialiser le nom
        };
        const updatedList = allConversations.map(c => c.id === newConvId ? updatedConv : c);
        setAllConversations(updatedList);
        // Charger les états de cette conversation "Go Home"
        setMessages(goHomeSessionData.messages);
        setHistory(goHomeSessionData.history);
        setCurrentStep(goHomeSessionData.currentStep);
        setUserRole(goHomeSessionData.userRole);
        setSelectedCategory(goHomeSessionData.selectedCategory);
        setUserAnswers(goHomeSessionData.userAnswers);
        setCurrentQuestionIndex(goHomeSessionData.currentQuestionIndex);
        setEmail(goHomeSessionData.email);
        setBirthdate(goHomeSessionData.birthdate);
        setActiveConversationId(newConvId);
    } else {
        // Si createNewConversation n'a pas mis à jour allConversations et qu'on est ici,
        // c'est un cas plus complexe. Pour l'instant, on force la création d'une nouvelle conversation
        // avec les bons états pour "Go Home".
        const forcedNewId = `conv_${Date.now()}_gohome`;
        const forcedNewConv: Conversation = {
            id: forcedNewId, name: "Nouvelle conversation", lastActivity: Date.now(), sessionData: goHomeSessionData
        };
        setAllConversations(prev => [...prev, forcedNewConv]);
        setMessages(goHomeSessionData.messages);
        setHistory(goHomeSessionData.history);
        setCurrentStep(goHomeSessionData.currentStep);
        setUserRole(goHomeSessionData.userRole);
        setSelectedCategory(goHomeSessionData.selectedCategory);
        setUserAnswers(goHomeSessionData.userAnswers);
        setCurrentQuestionIndex(goHomeSessionData.currentQuestionIndex);
        setEmail(goHomeSessionData.email);
        setBirthdate(goHomeSessionData.birthdate);
        setActiveConversationId(forcedNewId);
    }
    setSidebarOpen(false); 
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); // Réinitialiser les erreurs précédentes

    // La vérification des champs obligatoires est supprimée ici
    // if (!email || !password) {
    //   setLoginError("Veuillez remplir tous les champs.");
    //   return;
    // }

    // TODO: Implémenter une véritable logique de connexion ici
    // Si les champs sont remplis, on peut toujours tenter de les utiliser
    if (email || password) {
      console.log("Tentative de connexion (optionnelle) avec:", { email, password });
      // Ici, vous pourriez ajouter une logique pour tenter une vraie connexion si des identifiants sont fournis,
      // mais sans bloquer l'utilisateur s'ils ne le sont pas ou si la connexion échoue.
      // Pour l'instant, on logue simplement et on continue.
    }

    // On passe toujours à l'étape suivante
    setCurrentStep("intro");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(""); // Réinitialiser les erreurs précédentes

    if (!registerEmail || !registerPassword || !confirmPassword) {
      setRegisterError("Veuillez remplir tous les champs.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError("Les mots de passe ne correspondent pas.");
      return;
    }

    // TODO: Implémenter une véritable logique d'inscription ici (ex: appel API)
    console.log("Tentative d'inscription avec:", { email: registerEmail, password: registerPassword });

    // Simulation d'un appel API pour l'inscription
    // setIsLoading(true);
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // setIsLoading(false);

    // Pour cet exemple, on considère l'inscription réussie
    // Dans un cas réel, vous pourriez vouloir connecter l'utilisateur automatiquement après l'inscription
    // ou le rediriger vers la page de connexion avec un message de succès.
    setCurrentStep("intro"); // Ou "login" pour qu'il se connecte après inscription
  };

  // Questions pour la catégorie Santé
  const healthQuestions: Question[] = [
    {
      id: "securite-sociale",
      question: "Avez-vous un numéro de sécurité sociale ?",
      buttons: [
        { id: "oui", label: "Oui", icon: "👍" },
        { id: "non", label: "Non", icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui" ? "✅ Numéro de sécurité sociale" : "❌ Pas de numéro de sécurité sociale",
    },
    {
      id: "num-secu-provisoire",
      question: "Est-ce un numéro de sécurité sociale provisoire ?",
      buttons: [
        { id: "oui-provisoire", label: "Oui", icon: "👍" },
        { id: "non-provisoire", label: "Non", icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui-provisoire" ? "✅ Numéro provisoire" : "❌ Numéro non provisoire",
    },
    {
      id: "handicap",
      question: "Êtes-vous en situation de handicap ?",
      buttons: [
        { id: "oui", label: "Oui", icon: "👍" },
        { id: "non", label: "Non", icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui" ? "✅ En situation de handicap" : "❌ Pas en situation de handicap",
    },
    // Vous pouvez ajouter d'autres questions ici
  ]

  // Suggestions pour la catégorie Santé
  const healthSuggestions = [
    { id: "carte-perdue", label: "J'ai perdu ma carte vitale", icon: "💳" },
    { id: "obtenir-carte", label: "Obtenir une carte vitale", icon: "⭐" },
    { id: "renouveler-carte", label: "Renouveler ma carte vitale", icon: "🗂️" },
  ]

  const documents: Document[] = [
    { id: "attestation-ofpra", label: "Attestation OFPRA / Décision OFPRA / CNDA" },
    { id: "attestation-ada", label: "Attestation de demande d'asile (ADA)" },
    { id: "attestation-api", label: "Attestation prolongation d'instruction (API)" },
    { id: "carte-sejour", label: "Carte de séjour" },
    { id: "titre-sejour", label: "Titre de séjour" },
    { id: "passeport", label: "Passeport" },
    { id: "carte-ame", label: "Carte AME" },
    { id: "aucun", label: "Aucun de ces documents" },
  ]

  const categories: Category[] = [
    {
      id: "sante",
      icon: { src: "/logo_ameli.png", alt: "Logo Ameli" },
      title: "Santé",
      description: "Vous avez besoin d'aide en matière de santé",
    },
    // Vous pouvez ajouter d'autres catégories ici
  ]

  const toggleDocument = (id: string) => {
    if (id === "aucun") {
      // If "None of these documents" is selected, clear all other selections
      if (selectedDocuments.includes("aucun")) {
        setSelectedDocuments([])
      } else {
        setSelectedDocuments(["aucun"])
      }
    } else {
      // If any other document is selected, remove "None of these documents" if it's selected
      const newSelection = selectedDocuments.includes(id)
        ? selectedDocuments.filter((docId) => docId !== id)
        : [...selectedDocuments.filter((docId) => docId !== "aucun"), id]

      setSelectedDocuments(newSelection)
    }
  }

  const validateBirthdate = () => {
    // Simple validation for DD/MM/YYYY format
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

    if (birthdate && !regex.test(birthdate)) {
      setBirthdateError("Format invalide. Utilisez JJ/MM/AAAA")
      return false
    }

    setBirthdateError("")
    return true
  }

  const handleBirthdateSubmit = () => {
    if (validateBirthdate()) {
      setCurrentStep("dashboard")
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userQuestion = question.trim();
    if (!userQuestion) return;

    // Ajoute le message utilisateur à l'UI immédiatement
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      content: userQuestion,
      timestamp: new Date(),
    }
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Ajoute la question à l'historique
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      type: "user_query",
      data: {
        queryText: userQuestion,
        isSuggestion: false,
      },
      timestamp: new Date(),
    }
    setHistory(prevHistory => [...prevHistory, newHistoryItem]);

    setQuestion("")
    setIsLoading(true);

    // --- Préparation du contexte de qualification ---
    let qualificationContext = "";
    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      qualificationContext += `Catégorie choisie: ${category.title}\n`;
    }
    if (Object.keys(userAnswers).length > 0) {
      qualificationContext += "Réponses aux questions de qualification:\n";
      // Assumant que healthQuestions est accessible ici (il l'est dans ce fichier)
      // Vous pourriez avoir besoin d'adapter si les questions viennent d'ailleurs
      if (selectedCategory === 'sante') { // Adapter si plusieurs jeux de questions
          Object.entries(userAnswers).forEach(([questionId, answerId]) => {
          const questionData = healthQuestions.find(q => q.id === questionId);
          const answerData = questionData?.buttons.find(b => b.id === answerId);
          if (questionData && answerData) {
            qualificationContext += `- ${questionData.question}: ${answerData.label}\n`;
          }
        });
      }
    }
    qualificationContext = qualificationContext.trim();
    // -----------------------------------------------

    try {
      // Appel à l'API RAG avec le contexte
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: userQuestion,
          qualificationContext: qualificationContext || undefined // Envoie le contexte formaté
        }), 
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error text for better debugging
        throw new Error(`Erreur API: ${response.status} - ${errorText}`); // Improved error
      }

      const data = await response.json(); // Récupérer la réponse JSON { answer, sources }
      // Note: 'sources' n'est pas explicitement utilisé ici, mais est dans 'data'

      // Ajoute le message de l'assistant à l'UI
      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        content: data.answer, // Utilise data.answer
        timestamp: new Date(),
        // Vous pourriez ajouter les sources ici si nécessaire, ex: sources: data.sources
      }
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Ajoute la réponse à l'historique
      const assistantHistoryItem: HistoryItem = {
        id: `hist-ans-${Date.now()}`,
        type: "assistant_reply",
        data: {
          replyText: data.answer,
        },
        timestamp: new Date(),
      }
      setHistory(prevHistory => [...prevHistory, assistantHistoryItem]);

    } catch (error) {
      console.error("Erreur lors de l'appel RAG:", error);
      // Ajoute un message d'erreur à l'UI
      const errorMessage: Message = {
        id: `msg-error-${Date.now()}`,
        sender: "assistant",
        content: `Désolé, une erreur est survenue lors du traitement de votre question. ${error instanceof Error ? error.message : ''}`,
        timestamp: new Date(),
      }
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setSelectedCategory(categoryId)

      // Ajouter à l'historique
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        type: "category_selection",
        data: {
          categoryTitle: category.title,
          categoryIcon: typeof category.icon === 'string' ? category.icon : category.icon.alt,
        },
        timestamp: new Date(),
      }
      setHistory([newHistoryItem])

      // Ajouter le message d'introduction
      const introMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: `${typeof category.icon === 'string' ? category.icon : category.icon.alt} Vous avez choisi : ${category.title}\nJe vais poser quelques petites questions.\nC'est pour mieux comprendre votre situation.\nC'est rapide. Vous pouvez arrêter quand vous voulez.`,
        timestamp: new Date(),
        showButtons: true,
        buttons: [{ id: "agree", label: "D'accord", icon: "👍" }],
      }
      setMessages([introMessage])
      setUserAnswers({})
      setCurrentQuestionIndex(0)
    }
  }

  const handleAgreement = () => {
    // Désactiver les boutons du message d'introduction
    const updatedMessages = messages.map((msg) => ({
      ...msg,
      showButtons: false,
    }))

    // Ajouter la première question
    if (selectedCategory === "sante" && healthQuestions.length > 0) {
      const firstQuestion = healthQuestions[0]
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: firstQuestion.question,
        timestamp: new Date(),
        showButtons: true,
        buttons: firstQuestion.buttons,
      }

      setMessages([...updatedMessages, newMessage])
      setCurrentQuestionIndex(0) // Commencer avec la première question
    }
  }

  const handleAnswer = (buttonId: string, questionId: string) => {
    // Enregistrer la réponse
    setUserAnswers({
      ...userAnswers,
      [questionId]: buttonId,
    })

    // Trouver la question actuelle
    const currentQuestion = healthQuestions[currentQuestionIndex]

    // Ajouter la réponse à l'historique
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      type: "qualification_step",
      data: {
        questionText: currentQuestion.question,
        answerText: currentQuestion.historyLabel(buttonId),
        answerIcon: currentQuestion.historyIcon,
      },
      timestamp: new Date(),
    }

    setHistory([...history, newHistoryItem])

    // Désactiver les boutons de la question actuelle
    const updatedMessages = messages.map((msg) => ({
      ...msg,
      showButtons: false,
    }))

    // Passer à la question suivante s'il y en a une
    const nextQuestionIndex = currentQuestionIndex + 1
    if (nextQuestionIndex < healthQuestions.length) {
      const nextQuestion = healthQuestions[nextQuestionIndex]
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: nextQuestion.question,
        timestamp: new Date(),
        showButtons: true,
        buttons: nextQuestion.buttons,
      }

      setMessages([...updatedMessages, newMessage])
      setCurrentQuestionIndex(nextQuestionIndex)
    } else {
      // Fin des questions - Afficher le message de conclusion
      const conclusionMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: "Merci !\nMaintenant, vous pouvez :\n• ✍️ Poser une question\n• 🔍 Choisir une question simple",
        timestamp: new Date(),
        showSuggestions: true,
        suggestions: selectedCategory === "sante" ? healthSuggestions : [],
      }

      setMessages([...updatedMessages, conclusionMessage])
    }
  }

  const handleSuggestionClick = async (suggestionId: string) => {
    // Trouver la suggestion cliquée pour obtenir son label
    const suggestion = healthSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    const userQuestion = suggestion.label;

    // Ajoute le message utilisateur à l'UI immédiatement
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      content: userQuestion,
      timestamp: new Date(),
    }
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Ajoute la question à l'historique
    const suggestionHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      type: "user_query",
      data: {
        queryText: userQuestion,
        isSuggestion: true,
        suggestionIcon: suggestion.icon,
      },
      timestamp: new Date(),
    }
    setHistory(prevHistory => [...prevHistory, suggestionHistoryItem]);

    setIsLoading(true);

    // --- Préparation du contexte de qualification (identique à handleQuestionSubmit) ---
    let qualificationContext = "";
    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      qualificationContext += `Catégorie choisie: ${category.title}\n`;
    }
    if (Object.keys(userAnswers).length > 0) {
      qualificationContext += "Réponses aux questions de qualification:\n";
      if (selectedCategory === 'sante') { // Adapter si plusieurs jeux de questions
          Object.entries(userAnswers).forEach(([questionId, answerId]) => {
          const questionData = healthQuestions.find(q => q.id === questionId);
          const answerData = questionData?.buttons.find(b => b.id === answerId);
          if (questionData && answerData) {
            qualificationContext += `- ${questionData.question}: ${answerData.label}\n`;
          }
        });
      }
    }
    qualificationContext = qualificationContext.trim();
    // -----------------------------------------------

    try {
      // Appel à l'API RAG avec le texte de la suggestion
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: userQuestion, // Utilise le label de la suggestion comme question
          qualificationContext: qualificationContext || undefined 
        }), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Ajoute le message de l'assistant à l'UI
      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        content: data.answer,
        timestamp: new Date(),
      }
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Ajoute la réponse à l'historique
      const assistantHistoryItem: HistoryItem = {
        id: `hist-ans-${Date.now()}`,
        type: "assistant_reply",
        data: {
          replyText: data.answer,
        },
        timestamp: new Date(),
      }
      setHistory(prevHistory => [...prevHistory, assistantHistoryItem]);

    } catch (error) {
      console.error("Erreur lors de l'appel RAG depuis la suggestion:", error);
      const errorMessage: Message = {
        id: `msg-error-${Date.now()}`,
        sender: "assistant",
        content: `Désolé, une erreur est survenue lors du traitement de votre demande. ${error instanceof Error ? error.message : ''}`,
        timestamp: new Date(),
      }
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDetailedResponseAction = (actionId: string) => {
    if (actionId === "faire-demarche") {
      // Ouvrir ameli.fr dans un nouvel onglet (simulation)
      window.open("https://www.ameli.fr", "_blank")
    } else if (actionId === "sources") {
      // Afficher les sources (simulation)
      console.log("Affichage des sources")
    }
  }

  // Effet pour faire défiler vers le bas lors de nouveaux messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // --- Dashboard principal --- 
  // const selectedCategoryData = categories.find(c => c.id === selectedCategory); // Supprimé car non utilisé

  // Affichage des écrans d'onboarding
  if (currentStep !== "dashboard") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Section - White Background - Conditionally render based on currentStep */}
        {currentStep === "initial" && (
          <div className="lg:w-1/2 bg-[#faf9f6] flex items-center justify-center p-6 sm:p-12 order-1 lg:order-1">
            <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Emoji souriant"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 text-center">
                  Bienvenue sur l&apos;assistant
                </h1>
                <p className="text-gray-600 text-base sm:text-lg text-center">
                  Je suis un outil pensé pour vous aider à trouver les bonnes infos
                </p>
              </div>

              {/* Ces éléments s'affichent si currentStep est "initial" */}
              <div className="hidden sm:block space-y-4 sm:space-y-6 text-left">
                <h2 className="text-xl font-semibold text-gray-700">Comment ça marche ?</h2>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[16px]">1</span>
                    <span className="text-gray-600 text-sm sm:text-base">Vous choisissez votre rôle</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[16px]">2</span>
                    <span className="text-gray-600 text-sm sm:text-base">On vous pose quelques questions simples</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[16px]">3</span>
                    <span className="text-gray-600 text-sm sm:text-base">
                      L&apos;assistant vous propose des infos fiables et personnalisées
                    </span>
                  </li>
                </ol>
              </div>

              {/* Cet élément s'affiche si currentStep est "initial" */}
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base justify-center pt-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>C&apos;est rapide, gratuit et sans inscription</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Section - Brown Background - Adjust width based on currentStep */}
        <div
          className={`
            ${currentStep === "initial" ? "lg:w-1/2" : "w-full"} 
            bg-white flex flex-col justify-center items-center p-6 sm:p-12 order-2 lg:order-2
          `}
        >
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            {currentStep === "initial" && (
              // Initial screen with role selection
              <>
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#000000] mb-2 sm:mb-4">Et vous, qui êtes-vous ?</h2>
                  <p className="text-[#73726d] mb-1 sm:mb-2 text-sm sm:text-base">Vous êtes ici pour aider ou pour être accompagné ?</p>
                  <p className="text-[#73726d] text-sm sm:text-base">Choisissez votre parcours</p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <button
                      className="w-full bg-[#000000] text-white rounded-lg p-3 sm:p-4 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all text-base sm:text-lg"
                      onClick={() => {
                        setUserRole("accompagnant");
                        setCurrentStep("intro");
                      }}
                    >
                      <span className="text-yellow-400">👤</span>
                      <div className="text-left">
                        <div className="font-medium">Accompagnant.e</div>
                      </div>
                    </button>

                    <button
                      className="w-full bg-[#000000] text-white rounded-lg p-3 sm:p-4 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all text-base sm:text-lg"
                      onClick={() => {
                        setUserRole("accompagne");
                        setCurrentStep("login");
                      }}
                    >
                      <span className="text-yellow-400">👤</span>
                      <div className="text-left">
                        <div className="font-medium">Accompagné.e</div>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-center text-[#73726d] mt-3">
                    Ce choix permet d&apos;adapter l&apos;assistant à votre besoin
                  </p>
                </div>
              </>
            )}

            {currentStep === "login" && (
              // Nouvelle étape de connexion
              <div className="space-y-6 text-center">
                <div>
                  <h2 className="text-2xl font-semibold text-[#000000] mb-2">Connexion</h2>
                  <p className="text-gray-500 text-sm">Veuillez vous connecter pour continuer.</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Adresse e-mail (optionnel)"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe (optionnel)"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                    />
                  </div>
                  {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                  <button
                    type="submit"
                    className="rounded-full px-6 py-2.5 bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5 w-full max-w-xs mx-auto"
                  >
                    Se connecter
                  </button>
                  <p className="text-sm text-center mt-4">
                    Pas encore de compte ?{" "}
                    <button
                      type="button"
                      onClick={() => setCurrentStep("register")}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      S&apos;inscrire
                    </button>
                  </p>
                  <button // Bouton Précédent pour l'écran de connexion
                    type="button"
                    onClick={() => setCurrentStep("initial")}
                    className="text-sm text-gray-600 hover:underline mt-2 w-full max-w-xs mx-auto"
                  >
                    Précédent
                  </button>
                </form>
              </div>
            )}

            {currentStep === "register" && (
              // Nouvelle étape d'inscription
              <div className="space-y-6 text-center">
                <div>
                  <h2 className="text-2xl font-semibold text-[#000000] mb-2">Inscription</h2>
                  <p className="text-gray-500 text-sm">Créez un compte pour continuer.</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Adresse e-mail"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                      required
                    />
                  </div>
                  {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
                  <button
                    type="submit"
                    className="rounded-full px-6 py-2.5 bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5 w-full max-w-xs mx-auto"
                  >
                    S&apos;inscrire
                  </button>
                  <p className="text-sm text-center mt-4">
                    Déjà un compte ?{" "}
                    <button
                      type="button"
                      onClick={() => setCurrentStep("login")}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Se connecter
                    </button>
                  </p>
                  <button // Bouton Précédent pour l'écran d'inscription
                    type="button"
                    onClick={() => setCurrentStep("login")}
                    className="text-sm text-gray-600 hover:underline mt-2 w-full max-w-xs mx-auto"
                  >
                    Précédent (vers connexion)
                  </button>
                </form>
              </div>
            )}

            {currentStep === "intro" && (
              // Second screen with introduction message
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="border border-[#c8c6c6] rounded-lg p-6 bg-white mb-6 w-full max-w-md">
                  <p className="text-[#414143] text-center">
                    {userRole === "accompagnant" 
                      ? "Maintenant je vais vous poser des questions sur la personne que vous accompagnez"
                      : "Maintenant je vais vous poser des questions pour bien comprendre votre situation"}
                  </p>
                </div>

                <div className="flex justify-center w-full max-w-md mt-4 gap-3"> 
                  <button 
                    type="button"
                    onClick={() => setCurrentStep("initial")}
                    className="rounded-full px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                  >
                    Précédent
                  </button>
                  <button
                    className="rounded-full px-4 py-2 bg-[#f5f5f5] text-[#414143] flex items-center gap-2 hover:bg-gray-200 transition-all"
                    onClick={() => setCurrentStep("documents")}
                  >
                    <span>👍</span>
                    <span>D&apos;accord</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === "documents" && (
              // Third screen with document selection
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="space-y-5 w-full max-w-md">
                  <div className="text-center"> 
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1.5">
                      <span className="mr-1.5">
                        {userRole === "accompagnant" ? "🪪" : "📄"}
                      </span>
                      {userRole === "accompagnant" 
                        ? "Quels sont les documents dont elle dispose ?"
                        : "Quels documents avez-vous ?"}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {userRole === "accompagnant"
                        ? "Vous pouvez sélectionner plusieurs documents pour cette personne"
                        : "Vous pouvez sélectionner plusieurs documents"}
                    </p>
                  </div>

                  <div className="space-y-2.5 flex flex-col items-center">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-start gap-2 w-full max-w-xs">
                        <input
                          type="checkbox"
                          id={doc.id}
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocument(doc.id)}
                          className="mt-0.5 h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={doc.id} className="text-gray-600 text-xs sm:text-sm cursor-pointer">
                          {doc.label.replace("'", "&apos;")}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-3 mt-4 gap-3"> 
                    <button 
                      type="button"
                      onClick={() => setCurrentStep("intro")}
                      className="rounded-full px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all text-xs font-medium"
                    >
                      Précédent
                    </button>
                    <button
                      className="rounded-full px-4 py-2 bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 transition-all flex items-center gap-1.5"
                      onClick={() => setCurrentStep("birthdate")}
                    >
                      <span>Continuer</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "birthdate" && (
              // Fourth screen with birthdate input
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="space-y-6 w-full max-w-md">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-[#000000] mb-4">
                      <span className="mr-2">
                        {userRole === "accompagnant" ? "🗓️" : "📅"}
                      </span>
                      {userRole === "accompagnant"
                        ? "Quelle est sa date de naissance ?"
                        : "Quelle est votre date de naissance ?"}
                    </h2>
                    {/* Le placeholder et la gestion d'erreur peuvent rester génériques ou être adaptés si besoin */}
                  </div>

                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={birthdate}
                      onChange={(e) => {
                        setBirthdate(e.target.value)
                        if (birthdateError) setBirthdateError("")
                      }}
                      placeholder="JJ/MM/AAAA"
                      className="border border-[#c8c6c6] rounded-md p-3 w-full max-w-xs text-center"
                      aria-label="Date de naissance"
                    />
                    {birthdateError && <p className="text-red-500 text-sm mt-1">{birthdateError}</p>}

                    <div className="mt-6 flex justify-center w-full gap-3"> 
                      <button 
                        type="button"
                        onClick={() => setCurrentStep("documents")}
                        className="rounded-full px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                      >
                        Précédent
                      </button>
                      <button
                        className="rounded-full px-4 py-2 bg-[#f5f5f5] text-[#414143] flex items-center gap-2 hover:bg-gray-200 transition-all"
                        onClick={handleBirthdateSubmit}
                      >
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Valider</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Affichage du tableau de bord principal (après l'onboarding)
  return (
    <div className="h-screen bg-gray-50 flex text-gray-800 relative">
      {/* Overlay - visible sur tous les écrans quand sidebar ouverte */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header dynamique */}
        <header className="border-b border-gray-200 p-4 bg-white shadow-sm flex justify-center items-center">
          <button 
            onClick={handleGoHome} 
            className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-150 flex items-center gap-2"
            title="Retour à l'accueil"
          >
            <Image src="/placeholder.svg?height=32&width=32" alt="Logo Triptek" width={32} height={32} className="rounded-full" />
            Assistant Triptek
          </button>
        </header>

        <main ref={chatContainerRef} className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth bg-gray-50">
          {!selectedCategory ? (
            // Affichage des catégories
            <div className="max-w-3xl mx-auto text-center py-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">Triptek à votre service</h1>
              <p className="text-gray-600 mb-10">
                Comment puis-je vous aider ? Choisissez une catégorie pour commencer
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {typeof category.icon === 'string' ? (
                      <span className="text-3xl mb-3">{category.icon}</span>
                    ) : (
                      <Image src={category.icon.src} alt={category.icon.alt} width={80} height={80} className="mb-3" />
                    )}
                    {category.id !== "sante" && (
                      <h3 className="font-medium text-gray-800 mb-1.5">{category.title}</h3>
                    )}
                    <p className="text-sm text-gray-500 leading-relaxed">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Affichage du chat
            <div className="max-w-3xl mx-auto w-full">
              <div className="space-y-5">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex ${message.sender === "assistant" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`p-3 md:p-4 rounded-xl shadow-sm ${ 
                          message.sender === "assistant"
                            ? "bg-white text-gray-800 rounded-bl-none max-w-full sm:max-w-2xl md:max-w-3xl" // Largeur ajustée pour l'assistant
                            : "bg-blue-600 text-white rounded-br-none max-w-[85%] sm:max-w-xl md:max-w-2xl" // Largeur ajustée pour l'utilisateur
                        }`}
                      >
                        {message.sender === "assistant" && (
                          <div className="flex items-center mb-1.5">
                            <span className="mr-2 text-lg">😊</span>
                            <span className="font-medium text-sm text-gray-700">Assistant Triptek</span>
                          </div>
                        )}
                        <div className="text-sm md:text-base leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <span className={`text-xs mt-1.5 block ${ 
                          message.sender === 'assistant' ? 'text-gray-400' : 'text-blue-200' 
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>

                    {message.showButtons && message.buttons && (
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {message.buttons.map((button) => (
                          <button
                            key={button.id}
                            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                              button.id === "faire-demarche"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : button.id === "sources"
                                  ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                            onClick={() => {
                              if (button.id === "agree") {
                                handleAgreement()
                              } else if (button.id === "faire-demarche" || button.id === "sources") {
                                handleDetailedResponseAction(button.id)
                              } else {
                                // Trouver l'ID de la question actuelle
                                const currentQuestion = healthQuestions[currentQuestionIndex]
                                handleAnswer(button.id, currentQuestion.id)
                              }
                            }}
                          >
                            {button.icon && <span className="text-base">{button.icon}</span>}
                            <span>{button.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {message.showSuggestions && message.suggestions && (
                      <div className="flex flex-wrap justify-center gap-2 pt-3">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            className="rounded-lg px-3.5 py-1.5 text-sm font-medium bg-white border border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-150 flex items-center gap-1.5 shadow-sm"
                            onClick={() => handleSuggestionClick(suggestion.id)}
                          >
                            {suggestion.icon && <span className="text-base">{suggestion.icon}</span>}
                            <span>{suggestion.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Indicateur de chargement */} 
                {isLoading && (
                  <div className="flex justify-start">
                     <div className="max-w-[95%] md:max-w-[85%] p-3 md:p-4 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none">
                       <div className="flex items-center mb-1.5">
                         <span className="mr-2 text-lg">😊</span>
                         <span className="font-medium text-sm text-gray-700">Assistant Triptek</span>
                       </div>
                       <div className="flex items-center space-x-1">
                         <span className="text-sm text-gray-500">Recherche d&apos;informations...</span>
                         {/* Simple spinner */}
                         <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div> 
                       </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Question Input */}
        <div className="border-t border-gray-200 p-2 sm:p-4 bg-white">
          <form onSubmit={handleQuestionSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Posez votre question ici..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-100 text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white rounded-lg p-2 sm:p-2.5 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              disabled={!question.trim() || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {/* fonction supprimée, bouton inactif */}}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                disabled
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
