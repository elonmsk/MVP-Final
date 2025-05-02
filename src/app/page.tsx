"use client"

import type React from "react"

import Image from "next/image"
import { Sparkles, Check, Send, Lock, RefreshCw, CheckCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Step = "initial" | "intro" | "documents" | "birthdate" | "dashboard"

interface Document {
  id: string
  label: string
}

interface Category {
  id: string
  icon: string
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

interface HistoryItem {
  id: string
  type: "category" | "question" | "answer"
  content: string
  category?: string
  timestamp: Date
  icon?: string
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

// Helper function to format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Styles pour les composants Markdown
const markdownComponents = {
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-lg font-semibold mt-6 pt-3 border-t border-gray-200 mb-2" {...props} />,
  ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
  ol: ({ ...props }: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
  li: ({ ...props }: React.HTMLAttributes<HTMLLIElement>) => <li className="pl-2 mb-1" {...props} />,
  p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-2" {...props} />,
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => <strong className="font-medium" {...props} />,
}

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("initial")
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
    { id: "recepisse", label: "Récépissé de demande d'asile" },
    { id: "attestation-ofpra", label: "Attestation OFPRA / Décision OFPRA / CNDA" },
    { id: "attestation-ada", label: "Attestation de demande d'asile (ADA)" },
    { id: "carte-subsidiaire", label: 'Carte de séjour "protection subsidiaire"' },
    { id: "carte-refugie", label: 'Carte de séjour "réfugié"' },
    { id: "convocation", label: "Convocation à la préfecture" },
    { id: "aucun", label: "Aucun de ces documents" },
  ]

  const categories: Category[] = [
    {
      id: "sante",
      icon: "🏥",
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

    if (!birthdate) {
      setBirthdateError("Veuillez entrer votre date de naissance")
      return false
    } else if (!regex.test(birthdate)) {
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
      type: "question",
      content: userQuestion,
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
        type: "answer",
        content: data.answer, // Utilise data.answer
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
        type: "category",
        content: `${category.icon} Catégorie ${category.title}`,
        category: categoryId,
        timestamp: new Date(),
      }
      setHistory([newHistoryItem])

      // Ajouter le message d'introduction
      const introMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: `${category.icon} Vous avez choisi : ${category.title}\nJe vais poser quelques petites questions.\nC'est pour mieux comprendre votre situation.\nC'est rapide. Vous pouvez arrêter quand vous voulez.`,
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
      type: "answer",
      content: currentQuestion.historyLabel(buttonId),
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
      id: `hist-sugg-${Date.now()}`,
      type: "question",
      content: `${suggestion.icon ? suggestion.icon + " " : ""}${userQuestion}`,
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
        type: "answer",
        content: data.answer,
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
  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  // Affichage des écrans d'onboarding
  if (currentStep !== "dashboard") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:items-baseline gap-12 lg:gap-24 py-12">
          {/* Left Section - Always the same */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="mb-4">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="Emoji souriant"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h1 className="text-4xl font-bold text-[#000000] mb-2 text-center lg:text-left">
                Bienvenue sur l&apos;assistant
              </h1>
              <p className="text-[#73726d] text-lg text-center lg:text-left">
                Je suis un outil pensé pour vous aider à trouver les bonnes infos
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#000000]">Comment ça marche ?</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="font-bold text-[#000000] min-w-[20px]">1</span>
                  <span className="text-[#414143]">Vous choisissez votre rôle</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#000000] min-w-[20px]">2</span>
                  <span className="text-[#414143]">On vous pose quelques questions simples</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#000000] min-w-[20px]">3</span>
                  <span className="text-[#414143]">
                    L&apos;assistant vous propose des infos fiables et personnalisées
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex items-center gap-2 text-[#414143]">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span>C&apos;est rapide, gratuit et sans inscription</span>
            </div>
          </div>

          {/* Right Section - Changes based on current step */}
          <div className="flex-1 space-y-6">
            {currentStep === "initial" && (
              // Initial screen with role selection
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-semibold text-[#000000] mb-4">Et vous, qui êtes-vous ?</h2>
                  <p className="text-[#73726d] mb-2">Vous êtes ici pour aider ou pour être accompagné ?</p>
                  <p className="text-[#73726d]">Choisissez votre parcours</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                  <button
                    className="w-full bg-[#000000] text-white rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
                    onClick={() => setCurrentStep("intro")}
                  >
                    <span className="text-yellow-400">👤</span>
                    <div className="text-left">
                      <div className="font-medium">Accompagnant.e</div>
                      <div className="text-sm text-gray-300">(Travailleur social, bénévole)</div>
                    </div>
                  </button>

                  <button
                    className="w-full bg-[#000000] text-white rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
                    onClick={() => setCurrentStep("intro")}
                  >
                    <span className="text-yellow-400">👤</span>
                    <div className="text-left">
                      <div className="font-medium">Accompagné.e</div>
                      <div className="text-sm text-gray-300">(Je cherche un logement)</div>
                    </div>
                  </button>

                  <p className="text-xs text-center text-[#73726d] mt-2">
                    Ce choix permet d&apos;adapter l&apos;assistant à votre besoin
                  </p>
                </div>
              </>
            )}

            {currentStep === "intro" && (
              // Second screen with introduction message
              <div className="flex flex-col items-center lg:items-start justify-center h-full">
                <div className="border border-[#c8c6c6] rounded-lg p-6 bg-white mb-6 w-full">
                  <p className="text-[#414143]">
                    Maintenant je vais vous poser des questions pour bien comprendre ta situation
                  </p>
                </div>

                <div className="flex justify-center lg:justify-end w-full">
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
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-semibold text-[#000000] mb-4">
                    <span className="mr-2">📄</span>
                    Quels documents avez-vous ?
                  </h2>
                  <p className="text-[#73726d]">Vous pouvez sélectionner plusieurs documents</p>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={doc.id}
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => toggleDocument(doc.id)}
                        className="mt-1"
                      />
                      <label htmlFor={doc.id} className="text-[#414143] cursor-pointer">
                        {doc.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    className="rounded-full px-4 py-2 bg-[#f5f5f5] text-[#414143] flex items-center gap-2 hover:bg-gray-200 transition-all"
                    onClick={() => setCurrentStep("birthdate")}
                  >
                    <span>👍</span>
                    <span>Continuer</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === "birthdate" && (
              // Fourth screen with birthdate input
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-semibold text-[#000000] mb-4">
                    <span className="mr-2">📅</span>
                    Quelle est votre date de naissance ?
                  </h2>
                </div>

                <div className="flex flex-col items-center lg:items-start">
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

                  <div className="mt-6">
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
            )}
          </div>
        </div>
      </div>
    )
  }

  // Affichage du tableau de bord principal (après l'onboarding)
  return (
    <div className="h-screen bg-gray-50 flex text-gray-800">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Vos Questions</h2>
          <p className="text-sm text-gray-500 mb-6">Résumé et liens utiles</p>

          <div className="border border-gray-200 rounded-lg p-3 min-h-[160px]">
            {history.length > 0 ? (
              <ul className="w-full space-y-1.5">
                {history.map((item) => (
                  <li key={item.id} className="text-sm flex items-center gap-2 text-gray-700 p-1 rounded hover:bg-gray-100">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="truncate flex-1">{item.content}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <RefreshCw className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>

        {history.some((item) => item.category === "sante") && (
          <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
            <button
              className="flex items-center justify-center px-3 h-8 bg-gray-100 rounded-md text-xs text-gray-600 hover:bg-gray-200"
              onClick={() => window.open("https://www.ameli.fr", "_blank")}
            >
              ameli.fr
            </button>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 flex items-center text-xs text-gray-500">
          <Lock className="h-4 w-4 mr-2 text-gray-400" />
          <span>Vos informations ne sont pas sauvegardées</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header dynamique */}
        <header className="border-b border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium text-center text-gray-900">
            {selectedCategoryData ? `${selectedCategoryData.icon} ${selectedCategoryData.title}` : "Assistant Triptek"}
          </h2>
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
                    <span className="text-3xl mb-3">{category.icon}</span>
                    <h3 className="font-medium text-gray-800 mb-1.5">{category.title}</h3>
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
                        className={`max-w-[85%] p-3 md:p-4 rounded-xl shadow-sm ${
                          message.sender === "assistant"
                            ? "bg-white text-gray-800 rounded-bl-none"
                            : "bg-blue-600 text-white rounded-br-none"
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
                     <div className="max-w-[85%] p-3 md:p-4 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none">
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
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleQuestionSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Posez votre question ici..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-100"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg p-2.5 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}
