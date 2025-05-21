"use client"

import type React from "react"

import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Importer le composant Sparkles depuis react-icons
import { FaRegStar as Sparkles } from "react-icons/fa";

// Traductions pour le site
const translations: Translations = {
  fr: {
    welcome: "Bienvenue sur Triptek",
    welcomeDescription: "Votre assistant personnel pour trouver rapidement les informations dont vous avez besoin",
    howItWorks: "Comment ça marche ?",
    chooseRole: "Choisissez votre rôle",
    roleDescription: "Choisissez votre parcours pour adapter l'assistant à vos besoins",
    accompanist: "Accompagnant.e",
    accompanistDesc: "Vous assistez une personne",
    accompanied: "Accompagné.e",
    accompaniedDesc: "Vous cherchez de l'aide",
    step1: "Choisissez votre rôle",
    step1Desc: "Accompagnant ou accompagné",
    step2: "Répondez à quelques questions",
    step2Desc: "Pour comprendre votre situation",
    step3: "Obtenez votre réponse",
    step3Desc: "Des informations fiables et personnalisées",
    tagline: "Rapide, gratuit et sans inscription",
    whoAreYou: "Et vous, qui êtes-vous ?",
    changeLanguage: "English",
    // Login et inscription
    login: "Connexion",
    loginDescription: "Accédez à votre espace personnel",
    identifier: "Identifiant",
    identifierPlaceholder: "Votre identifiant à 6 chiffres",
    password: "Mot de passe",
    passwordPlaceholder: "Votre mot de passe",
    hidePassword: "Masquer le mot de passe",
    showPassword: "Afficher le mot de passe",
    connect: "Se connecter",
    or: "ou",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ? Se connecter",
    // Création de compte
    createAccountTitle: "Créer un compte",
    createAccountDescription: "Choisissez un mot de passe sécurisé",
    newPassword: "Mot de passe",
    newPasswordPlaceholder: "Créez votre mot de passe",
    createMyAccount: "Créer mon compte",
    // Confirmation de création
    accountCreated: "Compte créé avec succès",
    keepIdentifier: "Conservez précieusement votre identifiant pour vous connecter",
    yourIdentifier: "Votre identifiant",
    copyIdentifier: "Copier l'identifiant",
    identifierWarning: "Notez votre identifiant, il vous sera demandé à chaque connexion",
    continueToLogin: "Continuer vers la connexion",
    // Introduction
    welcome2: "Bienvenue",
    welcomeAccompanist: "Bienvenue accompagnant !",
    willAskQuestions: "Je vais vous poser quelques questions sur la personne que vous accompagnez.",
    willAskQuestionsUser: "Je vais vous poser quelques questions pour bien comprendre votre situation.",
    infoForPersonalization: "Ces informations nous permettront de personnaliser notre assistance et de mieux répondre à vos besoins.",
    takesAbout2Minutes: "Cette démarche prend environ 2 minutes",
    previous: "Précédent",
    agree: "D'accord",
    // Documents
    documentsQuestion: "Quels documents possède-t-elle ?",
    documentsQuestionUser: "Quels documents possédez-vous ?",
    selectMultiple: "Vous pouvez sélectionner plusieurs documents",
    continue: "Continuer",
    // Date de naissance
    birthDateQuestion: "Quelle est sa date de naissance ?",
    birthDateQuestionUser: "Quelle est votre date de naissance ?",
    birthDateHelp: "Cette information nous aide à personnaliser notre assistance",
    birthDate: "Date de naissance",
    birthDateFormat: "JJ/MM/AAAA",
    invalidFormat: "Format invalide. Utilisez JJ/MM/AAAA",
    validate: "Valider",
    // Dashboard
    helpToday: "Comment puis-je vous aider aujourd'hui ?",
    selectDomain: "Sélectionnez un domaine pour commencer",
    select: "Sélectionner",
    comingSoon: "Prochainement",
    comingSoonDesc: "D'autres domaines d'assistance seront disponibles bientôt",
    // Chat
    conversationWithAssistant: "Conversation avec l'assistant",
    category: "Catégorie :",
    changeCategory: "Changer de catégorie",
    assistantLabel: "Assistant",
    searchingInfo: "Recherche d'informations...",
    askQuestion: "Posez votre question à l'assistant...",
    clearText: "Effacer le texte",
    send: "Envoyer",
    enterToSend: "Appuyez sur Entrée pour envoyer • Nos réponses sont générées à partir de sources fiables",
    // Sidebar
    history: "Historique",
    noConversations: "Aucune conversation trouvée",
    newConversation: "Nouvelle conversation",
    // Confirmation modal
    confirmDeletion: "Confirmer la suppression",
    deleteConfirmText: "Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.",
    cancel: "Annuler",
    delete: "Supprimer",
    // Messages
    agree_button: "D'accord",
    categories: "Catégories",
    // Ajouts pour la traduction complète
    goHomeTitle: "Retour à l'accueil",
    beta: "BETA",
    assistantName: "Assistant Triptek",
    healthCategoryTitle: "Santé",
    healthCategoryDescription: "Vous avez besoin d'aide en matière de santé",
    comingSoonTitle: "Prochainement",
    comingSoonDescription: "D'autres domaines d'assistance seront disponibles bientôt",
    deleteConversationTitle: "Confirmer la suppression",
    deleteConversationText: "Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.",
    renameConversationPrompt: "Renommer la conversation:",
    accompanistEmoji: "👨‍💼",
    accompaniedEmoji: "👤",
    documentsEmojiAccompagnant: "🪪",
    documentsEmojiAccompagne: "📄",
    birthdateEmojiAccompagnant: "🗓️",
    birthdateEmojiAccompagne: "📅",
    chatHeaderIcon: "Assistant Icon", // alt text for the icon in chat header
    agreeIcon: "👍",
    thumbUpIcon: "👍",
    thumbDownIcon: "👎",
    lostCardIcon: "💳",
    getCardIcon: "⭐",
    renewCardIcon: "🗂️",
    noSecuYes: "✅ Numéro de sécurité sociale",
    noSecuNo: "❌ Pas de numéro de sécurité sociale",
    provisionalSecuYes: "✅ Numéro provisoire",
    provisionalSecuNo: "❌ Numéro non provisoire",
    handicapYes: "✅ En situation de handicap",
    handicapNo: "❌ Pas en situation de handicap",
    qualificationThanks: "Merci !",
    qualificationNextSteps: "Maintenant, vous pouvez :\n• ✍️ Poser une question\n• 🔍 Choisir une question simple",
    assistantIntroMessage: "{icon} Vous avez choisi : {category}\nJe vais poser quelques petites questions.\nC'est pour mieux comprendre votre situation.\nC'est rapide. Vous pouvez arrêter quand vous voulez.",
    errorProcessingRequest: "Désolé, une erreur est survenue lors du traitement de votre question.",
    errorProcessingSuggestion: "Désolé, une erreur est survenue lors du traitement de votre demande.",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    loginError: "Identifiant ou mot de passe incorrect",
    loginSuccess: "Connexion réussie !",
    copiedSuccess: "Copié !",
    takeAbout2Minutes: "Cette démarche prend environ 2 minutes",
    sendButton: "Envoyer",
    clearButtonTitle: "Effacer le texte",
    sendButtonTitle: "Envoyer votre question",
    enterToSendFooter: "Appuyez sur Entrée pour envoyer • Nos réponses sont générées à partir de sources fiables"
  },
  en: {
    welcome: "Welcome to Triptek",
    welcomeDescription: "Your personal assistant to quickly find the information you need",
    howItWorks: "How does it work?",
    chooseRole: "Choose your role",
    roleDescription: "Choose your path to adapt the assistant to your needs",
    accompanist: "Support Worker",
    accompanistDesc: "You're assisting someone",
    accompanied: "User",
    accompaniedDesc: "You're looking for help",
    step1: "Choose your role",
    step1Desc: "Support worker or user",
    step2: "Answer a few questions",
    step2Desc: "To understand your situation",
    step3: "Get your answer",
    step3Desc: "Reliable and personalized information",
    tagline: "Fast, free, and no registration required",
    whoAreYou: "And you, who are you?",
    changeLanguage: "Français",
    // Login and registration
    login: "Login",
    loginDescription: "Access your personal space",
    identifier: "Identifier",
    identifierPlaceholder: "Your 6-digit identifier",
    password: "Password",
    passwordPlaceholder: "Your password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    connect: "Log in",
    or: "or",
    createAccount: "Create an account",
    alreadyHaveAccount: "Already have an account? Log in",
    // Account creation
    createAccountTitle: "Create an account",
    createAccountDescription: "Choose a secure password",
    newPassword: "Password",
    newPasswordPlaceholder: "Create your password",
    createMyAccount: "Create my account",
    // Creation confirmation
    accountCreated: "Account created successfully",
    keepIdentifier: "Keep your identifier safe for logging in",
    yourIdentifier: "Your identifier",
    copyIdentifier: "Copy identifier",
    identifierWarning: "Note your identifier, it will be required for each login",
    continueToLogin: "Continue to login",
    // Introduction
    welcome2: "Welcome",
    welcomeAccompanist: "Welcome support worker!",
    willAskQuestions: "I'll ask you a few questions about the person you're assisting.",
    willAskQuestionsUser: "I'll ask you a few questions to better understand your situation.",
    infoForPersonalization: "This information will help us personalize our assistance and better respond to your needs.",
    takesAbout2Minutes: "This process takes about 2 minutes",
    previous: "Previous",
    agree: "I agree",
    // Documents
    documentsQuestion: "What documents do they have?",
    documentsQuestionUser: "What documents do you have?",
    selectMultiple: "You can select multiple documents",
    continue: "Continue",
    // Birth date
    birthDateQuestion: "What is their date of birth?",
    birthDateQuestionUser: "What is your date of birth?",
    birthDateHelp: "This information helps us personalize our assistance",
    birthDate: "Date of birth",
    birthDateFormat: "DD/MM/YYYY",
    invalidFormat: "Invalid format. Use DD/MM/YYYY",
    validate: "Validate",
    // Dashboard
    helpToday: "How can I help you today?",
    selectDomain: "Select a domain to start",
    select: "Select",
    comingSoon: "Coming soon",
    comingSoonDesc: "More assistance areas will be available soon",
    // Chat
    conversationWithAssistant: "Conversation with assistant",
    category: "Category:",
    changeCategory: "Change category",
    assistantLabel: "Assistant",
    searchingInfo: "Searching for information...",
    askQuestion: "Ask your question to the assistant...",
    clearText: "Clear text",
    send: "Send",
    enterToSend: "Press Enter to send • Our responses are generated from reliable sources",
    // Sidebar
    history: "History",
    noConversations: "No conversations found",
    newConversation: "New conversation",
    // Confirmation modal
    confirmDeletion: "Confirm deletion",
    deleteConfirmText: "Are you sure you want to delete this conversation? This action is irreversible.",
    cancel: "Cancel",
    delete: "Delete",
    // Messages
    agree_button: "I agree",
    categories: "Categories",
    // Additions for full translation
    goHomeTitle: "Back to home",
    beta: "BETA",
    assistantName: "Triptek Assistant",
    healthCategoryTitle: "Health",
    healthCategoryDescription: "You need help with health matters",
    comingSoonTitle: "Coming soon",
    comingSoonDescription: "More assistance areas will be available soon",
    deleteConversationTitle: "Confirm deletion",
    deleteConversationText: "Are you sure you want to delete this conversation? This action is irreversible.",
    renameConversationPrompt: "Rename conversation:",
    accompanistEmoji: "👨‍💼",
    accompaniedEmoji: "👤",
    documentsEmojiAccompagnant: "🪪",
    documentsEmojiAccompagne: "📄",
    birthdateEmojiAccompagnant: "🗓️",
    birthdateEmojiAccompagne: "📅",
    chatHeaderIcon: "Assistant Icon",
    agreeIcon: "👍",
    thumbUpIcon: "👍",
    thumbDownIcon: "👎",
    lostCardIcon: "💳",
    getCardIcon: "⭐",
    renewCardIcon: "🗂️",
    noSecuYes: "✅ Social security number",
    noSecuNo: "❌ No social security number",
    provisionalSecuYes: "✅ Provisional number",
    provisionalSecuNo: "❌ Non-provisional number",
    handicapYes: "✅ Disabled",
    handicapNo: "❌ Not disabled",
    qualificationThanks: "Thank you!",
    qualificationNextSteps: "Now you can:\n• ✍️ Ask a question\n• 🔍 Choose a simple question",
    assistantIntroMessage: "{icon} You chose: {category}\nI'll ask a few quick questions.\nThis is to better understand your situation.\nIt's quick. You can stop anytime.",
    errorProcessingRequest: "Sorry, an error occurred while processing your question.",
    errorProcessingSuggestion: "Sorry, an error occurred while processing your request.",
    passwordMismatch: "Passwords do not match",
    loginError: "Incorrect identifier or password",
    loginSuccess: "Login successful!",
    copiedSuccess: "Copied!",
    takeAbout2Minutes: "This process takes about 2 minutes",
    sendButton: "Send",
    clearButtonTitle: "Clear text",
    sendButtonTitle: "Send your question",
    enterToSendFooter: "Press Enter to send • Our responses are generated from reliable sources"
  }
}

// Ajouter ces styles de bouton au début du fichier après les variables BORDER_RADIUS
const BUTTON_STYLES = {
  primary: "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm",
  secondary: "border border-neutral-200 bg-white text-neutral-700 py-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 flex items-center justify-center gap-2",
  accent: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm",
  navigation: {
    next: "px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm",
    prev: "px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-2"
  },
  role: "w-full bg-gradient-to-br from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg p-4 flex items-center gap-4 transition-all group shadow-sm"
}

type Step = "initial" | "intro" | "documents" | "birthdate" | "dashboard" | "login" | "inscription" | "inscription-done"
type UserRole = "accompagnant" | "accompagne" | null

// Nouveaux types pour l'historique
export type HistoryEntryType =
  | "category_selection"
  | "qualification_step"
  | "user_query"
  | "assistant_reply";

// Type pour les traductions
type Translations = {
  fr: {
    [key: string]: string;
  };
  en: {
    [key: string]: string;
  };
};

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
  // Les erreurs (, , etc.) sont transitoires et ne sont pas stockées par conversation
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
const LANGUAGE_STORAGE_KEY = "triptekLanguage"; // Nouvelle clé pour stocker la préférence de langue

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
  const [loginPassword, setLoginPassword] = useState<string>("")
  const [inscriptionPassword, setInscriptionPassword] = useState<string>("")
  const [identifiant, setIdentifiant] = useState<string>("")
  const [uid, setUid] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showInscriptionPassword, setShowInscriptionPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<keyof Translations>("fr") // État pour suivre la langue actuelle

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

  // Nouveaux états pour gérer plusieurs conversations
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Nouveaux états pour la modale de confirmation de suppression
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [conversationToDeleteId, setConversationToDeleteId] = useState<string | null>(null); // Nouvel état

  // Corriger l'erreur de linter pour useCallback
  const generateDefaultConversationName = useCallback((currentMessages: Message[]): string => {
    const firstUserMessage = currentMessages.find(m => m.sender === 'user');
    if (firstUserMessage && firstUserMessage.content.trim()) {
      return firstUserMessage.content.trim().substring(0, 30) + (firstUserMessage.content.trim().length > 30 ? "..." : "");
    }
    return translations[language].newConversation;
  }, [language]);

  // Fonction pour changer de langue
  const toggleLanguage = () => {
    const newLanguage = language === "fr" ? "en" : "fr";
    setLanguage(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  };

  // Effet pour charger la langue depuis localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as "fr" | "en" | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Effet pour charger l'état depuis localStorage au montage initial
  useEffect(() => {
    try {
      // Essayer de charger les données du localStorage
      const storedDataStr = localStorage.getItem(APP_STORAGE_KEY);
      
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr) as AppStorage;
        
        // Vérifier si les données sont valides
        if (storedData && storedData.conversations && Array.isArray(storedData.conversations)) {
          setAllConversations(storedData.conversations);
          
          // Si une conversation active est définie et existe dans la liste
          if (storedData.activeConversationId && 
              storedData.conversations.some(c => c.id === storedData.activeConversationId)) {
            
            const activeConv = storedData.conversations.find(c => c.id === storedData.activeConversationId);
            if (activeConv) {
              setActiveConversationId(activeConv.id);
              
              // Charger les états de la conversation active
              if (activeConv.sessionData) {
                const data = activeConv.sessionData;
                setMessages(data.messages || []);
                setHistory(data.history || []);
                setUserRole(data.userRole);
                setSelectedCategory(data.selectedCategory);
                setUserAnswers(data.userAnswers || {});
                setCurrentQuestionIndex(data.currentQuestionIndex || 0);
                setEmail(data.email || "");
                setBirthdate(data.birthdate || "");
                
                // Ouvrir l'historique par défaut pour les utilisateurs "accompagné"
                if (data.userRole === "accompagne") {
                } else {
                }
              }
              setCurrentStep("initial"); // Forcer l'étape initiale après le chargement des autres données
              
              return; // Sortir de l'effet si une conversation active a été chargée
            }
          }
        }
      }
      
      // Si aucune donnée valide n'a été trouvée ou si pas de conversation active, initialiser
      setCurrentStep("initial");
      setUserRole(null);
      setSelectedCategory(null);
      setMessages([]);
      setHistory([]);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setEmail("");
      setBirthdate("");
      setActiveConversationId(null);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // En cas d'erreur, initialiser avec des valeurs par défaut
      setCurrentStep("initial");
      setUserRole(null);
      setSelectedCategory(null);
      setMessages([]);
      setHistory([]);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setEmail("");
      setBirthdate("");
      setActiveConversationId(null);
    }
  }, [
    allConversations, activeConversationId, birthdate, currentQuestionIndex, currentStep, email, generateDefaultConversationName, history, language, messages, selectedCategory, userAnswers, userRole
  ]);

  // Effet pour sauvegarder l'état dans localStorage lors de changements
  useEffect(() => {
    // Guard for initial empty state or when activeId is null but there are no conversations to save
    if (!activeConversationId && allConversations.length === 0) {
        // If localStorage is already empty or reflects this state, no need to write again.
        // This avoids clearing localStorage if it was populated but app initializes with no activeId temporarily.
        const storedDataStr = localStorage.getItem(APP_STORAGE_KEY);
        if (storedDataStr) {
            try {
                const storedData = JSON.parse(storedDataStr) as AppStorage;
                if (storedData.conversations.length === 0 && storedData.activeConversationId === null) {
                    return; 
                }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) { 
                // If parsing fails, proceed to save a clean state if necessary
            }
        } else {
            return; // localStorage is empty, nothing to do.
        }
    }

    let conversationsForStorage = [...allConversations]; // Make a mutable copy

    if (activeConversationId) {
        const activeConvIndex = conversationsForStorage.findIndex(c => c.id === activeConversationId);
        const currentSessionData: ConversationSessionData = {
            messages, history, currentStep, userRole, selectedCategory,
            userAnswers, currentQuestionIndex, email, birthdate,
        };

        let conversationListChanged = false;

        if (activeConvIndex !== -1) {
            const oldConv = conversationsForStorage[activeConvIndex];
            const updatedActiveConv = {
                ...oldConv,
                sessionData: currentSessionData,
                lastActivity: Date.now(),
                name: (oldConv.name === translations[language].newConversation && messages.length > 0)
                      ? generateDefaultConversationName(messages)
                      : oldConv.name
            };
            
            if (JSON.stringify(conversationsForStorage[activeConvIndex]) !== JSON.stringify(updatedActiveConv)) {
                 conversationsForStorage[activeConvIndex] = updatedActiveConv;
                 conversationListChanged = true;
            }
        } else {
            // Active conversation ID exists, but not in allConversations.
            // This implies it's new and should be added.
            const newConv: Conversation = {
                id: activeConversationId,
                name: generateDefaultConversationName(messages), // Use current messages for name
                lastActivity: Date.now(),
                sessionData: currentSessionData
            };
            conversationsForStorage = [...conversationsForStorage, newConv];
            conversationListChanged = true;
        }
        
        if (conversationListChanged) {
            // Only update the state if the structure of conversationsForStorage actually changed
            // or if the content of the active conversation within it changed.
            // This will cause the effect to run again. The stringify check above helps break infinite loops
            // if the data itself hasn't changed meaningfully.
            setAllConversations(conversationsForStorage);
        }

        const newStorage: AppStorage = {
            conversations: conversationsForStorage, // Save the potentially updated list
            activeConversationId,
        };
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newStorage));

    } else { // No activeConversationId
        // This means we should save the current state of allConversations with activeConversationId as null.
        // This is important after deleting the last active conversation, or if the app starts without an active one.
        const newStorage: AppStorage = {
            conversations: allConversations, 
            activeConversationId: null,
        };
        // Only write to localStorage if it's different from what's already there or if it's a deliberate clear.
        const currentStorageStr = localStorage.getItem(APP_STORAGE_KEY);
        if (!currentStorageStr || JSON.stringify(JSON.parse(currentStorageStr)) !== JSON.stringify(newStorage)) {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newStorage));
        }
    }
  }, [
    messages, history, currentStep, userRole, selectedCategory, userAnswers,
    currentQuestionIndex, email, birthdate, activeConversationId, allConversations,
    generateDefaultConversationName, language // Ajout de language et generateDefaultConversationName aux dépendances
  ]);


  const createNewConversation = (currentListOfConversations: Conversation[], isInitialLoad = false) => {
    const newConversationId = `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      name: "Nouvelle conversation",
      lastActivity: Date.now(),
      sessionData: {
        messages: [],
        history: [],
        currentStep: "dashboard", 
        userRole: userRole, // Preserve current userRole when creating a new conversation
        selectedCategory: null, 
        userAnswers: {},
        currentQuestionIndex: 0,
        email: "", // Reset email for a new conversation
        birthdate: "", // Reset birthdate for a new conversation
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
    setSelectedDocuments([]);
    setBirthdateError("");

    setActiveConversationId(newConversationId);
    return newConversationId; // Retourner l'ID pour le chargement initial
  }

  const handleGoHome = () => {
    // createNewConversation met à jour allConversations, activeConversationId,
    // et tous les états (messages, history, currentStep="dashboard", userRole préservé, etc.)
    // L'ID retourné par createNewConversation n'est pas crucial ici car la fonction met déjà à jour l'état global.
    createNewConversation(allConversations);

    // Gérer l'ouverture de la barre latérale en fonction du rôle utilisateur.
    // userRole ici est celui qui était actif avant l'appel. createNewConversation
    // le préserve pour la nouvelle session de conversation.
    if (userRole === "accompagne") {
    } else {
    }
  };



  // Questions pour la catégorie Santé
  const healthQuestions: Question[] = [
    {
      id: "securite-sociale",
      question: translations[language].willAskQuestions, // Clé générique, à affiner si besoin
      buttons: [
        { id: "oui", label: translations[language].thumbUpIcon, icon: "👍" }, // Utiliser les clés pour les labels si disponibles
        { id: "non", label: translations[language].thumbDownIcon, icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui" ? translations[language].noSecuYes : translations[language].noSecuNo,
    },
    {
      id: "num-secu-provisoire",
      question: translations[language].willAskQuestionsUser, // Clé générique, à affiner si besoin
      buttons: [
        { id: "oui-provisoire", label: translations[language].thumbUpIcon, icon: "👍" },
        { id: "non-provisoire", label: translations[language].thumbDownIcon, icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui-provisoire" ? translations[language].provisionalSecuYes : translations[language].provisionalSecuNo,
    },
    {
      id: "handicap",
      question: translations[language].infoForPersonalization, // Clé générique, à affiner si besoin
      buttons: [
        { id: "oui", label: translations[language].thumbUpIcon, icon: "👍" },
        { id: "non", label: translations[language].thumbDownIcon, icon: "👎" },
      ],
      historyLabel: (answerId) =>
        answerId === "oui" ? translations[language].handicapYes : translations[language].handicapNo,
    },
    // Vous pouvez ajouter d'autres questions ici
  ]

  // Suggestions pour la catégorie Santé
  const healthSuggestions = [
    { id: "carte-perdue", label: translations[language].lostCardIcon + " J'ai perdu ma carte vitale", icon: "💳" },
    { id: "obtenir-carte", label: translations[language].getCardIcon + " Obtenir une carte vitale", icon: "⭐" },
    { id: "renouveler-carte", label: translations[language].renewCardIcon + " Renouveler ma carte vitale", icon: "🗂️" },
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
      title: translations[language].healthCategoryTitle, // Modifié ici
      description: translations[language].healthCategoryDescription, // Modifié ici
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
      setBirthdateError(translations[language].invalidFormat) // Modifié ici
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

  const handleInscription = async () => {
    if (!inscriptionPassword) return

    setLoading(true)
    const res = await fetch('/api/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: inscriptionPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setMessage(`❌ ${data.error}`)
    } else {
      setUid(data.uid)
      setCopied(false) // S'assurer que copied est réinitialisé
      setCurrentStep("inscription-done")
    }
  }

  const handleLogin = async () => {
    setMessage(null)

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiant, password: loginPassword }),
    })

    const data = await res.json()

    if (!res.ok) {
      setIsSuccess(false)
      setMessage(`❌ ${data.error || translations[language].loginError}`) // Modifié ici
    } else {
      setIsSuccess(true)
      setMessage(`✅ ${translations[language].loginSuccess}`) // Modifié ici
      setUserRole("accompagne")
      setCurrentStep("intro")
      // Ouvrir automatiquement l'historique lors de la connexion d'un accompagné
    }
  }

  const copyToClipboard = () => {
    if (uid) {
      const textArea = document.createElement('textarea')
      textArea.value = uid
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        setCopied(true)
        // Afficher un message de succès de copie si nécessaire
        // setMessage(`✅ ${translations[language].copiedSuccess}`); 
        setTimeout(() => {
            setCopied(false);
            // setMessage(null); // Optionnel: effacer le message après un délai
        }, 2000);
      } catch (err) {
        console.error('Erreur lors de la copie:', err)
      }
      
      document.body.removeChild(textArea)
    }
  }

  const handleQuestionSubmit = async () => {
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
                <div className="mb-5 bg-white p-4 rounded-2xl shadow-sm">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Logo Triptek"
                    width={80}
                    height={80}
                    className="rounded-xl"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 text-center">
                  {translations[language].welcome}
                </h1>
                <p className="text-neutral-600 text-base sm:text-lg text-center max-w-sm">
                  {translations[language].welcomeDescription}
                </p>
                
                {/* Bouton de changement de langue */}
                <button
                  onClick={toggleLanguage}
                  className="mt-4 py-2 px-4 bg-white border border-neutral-200 rounded-full text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m12.5 8-4 8h7.5" />
                    <path d="M8 16h7.5" />
                    <path d="m11 8-3 4" />
                    <path d="m15 12 3-4" />
                  </svg>
                  {translations[language].changeLanguage}
                </button>
              </div>

              {/* Comment ça marche section */}
              <div className="hidden sm:block space-y-5 sm:space-y-6 text-left bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-xl font-semibold text-neutral-800">{translations[language].howItWorks}</h2>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">1</div>
                    <div>
                      <p className="text-neutral-700 font-medium">{translations[language].step1}</p>
                      <p className="text-neutral-500 text-sm">{translations[language].step1Desc}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">2</div>
                    <div>
                      <p className="text-neutral-700 font-medium">{translations[language].step2}</p>
                      <p className="text-neutral-500 text-sm">{translations[language].step2Desc}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">3</div>
                    <div>
                      <p className="text-neutral-700 font-medium">{translations[language].step3}</p>
                      <p className="text-neutral-500 text-sm">{translations[language].step3Desc}</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Tag line */}
              <div className="hidden sm:flex items-center justify-center gap-2 text-neutral-500 bg-white py-3 px-6 rounded-full shadow-sm border border-neutral-100">
                <Sparkles className="h-4 w-4 text-primary-500" />
                <span className="text-sm">{translations[language].tagline}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Section - White Background - Adjust width based on currentStep */}
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
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">{translations[language].whoAreYou}</h2>
                  <p className="text-neutral-600 mb-2 text-sm sm:text-base">{translations[language].roleDescription}</p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <button
                      onClick={() => {
                        setUserRole("accompagnant");
                        setCurrentStep("intro");
                      }}
                      className={BUTTON_STYLES.role}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/30 transition-all">
                        {translations[language].accompanistEmoji}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{translations[language].accompanist}</div>
                        <div className="text-xs text-white/80 mt-0.5">{translations[language].accompanistDesc}</div>
                      </div>
                    </button>

                    <button
                      className={BUTTON_STYLES.role}
                      onClick={() => {
                        setUserRole("accompagne");
                        setCurrentStep("login");
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/30 transition-all">
                        {translations[language].accompaniedEmoji}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{translations[language].accompanied}</div>
                        <div className="text-xs text-white/80 mt-0.5">{translations[language].accompaniedDesc}</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {currentStep === "login" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{translations[language].login}</h2>
                      <p className="text-neutral-500 text-sm">{translations[language].loginDescription}</p>
                  </div>

                    <div className="space-y-5">
                    <div className="relative">
                        <label htmlFor="identifiant" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          {translations[language].identifier}
                        </label>
                      <input
                          id="identifiant"
                        type="text"
                          placeholder={translations[language].identifierPlaceholder}
                        value={identifiant}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setIdentifiant(value)
                        }}
                          className="w-full border border-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white text-neutral-800 shadow-sm text-sm transition-all"
                      />
                    </div>

                      <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          {translations[language].password}
                        </label>
                    <div className="relative">
                      <input
                            id="password"
                        type={showLoginPassword ? 'text' : 'password'}
                            placeholder={translations[language].passwordPlaceholder}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full border border-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white text-neutral-800 shadow-sm text-sm transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        tabIndex={-1}
                            aria-label={showLoginPassword ? translations[language].hidePassword : translations[language].showPassword}
                          >
                            {showLoginPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                      </button>
                        </div>
                    </div>

                      <div className="pt-3">
                    <button
                      onClick={handleLogin}
                          className={`w-full ${BUTTON_STYLES.primary}`}
                    >
                      <span>{translations[language].connect}</span>
                    </button>

                        <div className="flex items-center my-5">
                          <div className="flex-grow h-px bg-neutral-200"></div>
                          <span className="px-4 text-sm text-neutral-400">{translations[language].or}</span>
                          <div className="flex-grow h-px bg-neutral-200"></div>
                        </div>

                    <button
                      onClick={() => {
                        setLoginPassword("")
                        setShowLoginPassword(false)
                        setCurrentStep("inscription")
                      }}
                          className={`w-full ${BUTTON_STYLES.secondary}`}
                    >
                      <span>{translations[language].createAccount}</span>
                    </button>
                      </div>
                  </div>

                  {message && (
                      <div className={`mt-5 flex items-center justify-center gap-2 ${
                        isSuccess ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                      } p-3 rounded-lg`}>
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === "inscription" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{translations[language].createAccountTitle}</h2>
                      <p className="text-neutral-500 text-sm">{translations[language].createAccountDescription}</p>
                  </div>

                    <div className="space-y-5">
                      <div className="relative">
                        <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          {translations[language].newPassword}
                        </label>
                    <div className="relative">
                      <input
                            id="new-password"
                        type={showInscriptionPassword ? 'text' : 'password'}
                            placeholder={translations[language].newPasswordPlaceholder}
                        value={inscriptionPassword}
                        onChange={(e) => setInscriptionPassword(e.target.value)}
                            className="w-full border border-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white text-neutral-800 shadow-sm text-sm transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInscriptionPassword(!showInscriptionPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        tabIndex={-1}
                            aria-label={showInscriptionPassword ? translations[language].hidePassword : translations[language].showPassword}
                          >
                            {showInscriptionPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                      </button>
                        </div>
                    </div>

                      <div className="pt-3">
                    <button
                      onClick={handleInscription}
                          className={`w-full ${BUTTON_STYLES.primary}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>{translations[language].createMyAccount}</span>
                      )}
                    </button>

                        <div className="flex items-center my-5">
                          <div className="flex-grow h-px bg-neutral-200"></div>
                          <span className="px-4 text-sm text-neutral-400">{translations[language].or}</span>
                          <div className="flex-grow h-px bg-neutral-200"></div>
                        </div>

                    <button
                      onClick={() => {
                        setInscriptionPassword("")
                        setShowInscriptionPassword(false)
                        setCurrentStep("login")
                      }}
                          className={`w-full ${BUTTON_STYLES.secondary}`}
                    >
                      <span>{translations[language].alreadyHaveAccount}</span>
                    </button>
                      </div>
                  </div>

                  {message && (
                      <div className="mt-5 p-3 bg-red-50 text-red-500 rounded-lg">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === "inscription-done" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{translations[language].accountCreated}</h2>
                      <p className="text-neutral-600 text-sm mb-6">{translations[language].keepIdentifier}</p>
                  </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">{translations[language].yourIdentifier}</span>
                      <button
                        onClick={copyToClipboard}
                          className="p-1.5 text-neutral-400 hover:text-primary-500 transition-colors rounded-md hover:bg-neutral-100"
                        title={translations[language].copyIdentifier}
                      >
                          {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                          )}
                      </button>
                      </div>
                      <div className="text-2xl font-mono text-primary-600 font-semibold tracking-wider">
                        {uid}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
                        <span className="text-sm font-medium">{translations[language].identifierWarning}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep("login")}
                      className={`w-full ${BUTTON_STYLES.primary}`}
                    >
                      <span>{translations[language].continueToLogin}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "intro" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                        {userRole === "accompagnant" ? translations[language].accompanistEmoji : translations[language].accompaniedEmoji}
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                        {userRole === "accompagnant" ? translations[language].welcomeAccompanist : translations[language].welcome2}
                      </h2>
                      
                      <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-5 text-left mb-6 shadow-sm">
                        <p className="text-neutral-700 mb-2">
                    {userRole === "accompagnant"
                            ? translations[language].willAskQuestions
                            : translations[language].willAskQuestionsUser}
                        </p>
                        <p className="text-neutral-600 text-sm">
                          {translations[language].infoForPersonalization}
                  </p>
                </div>

                      <div className="flex items-center gap-2 justify-center mb-2 text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                        <p className="text-sm font-medium">{translations[language].takesAbout2Minutes}</p>
                      </div>
                    </div>

                    <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("initial")}
                        className={BUTTON_STYLES.navigation.prev}
                  >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        <span>{translations[language].previous}</span>
                  </button>
                  <button
                        className={BUTTON_STYLES.navigation.next}
                    onClick={() => setCurrentStep("documents")}
                  >
                        <span>{translations[language].agree_button}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "documents" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                        {userRole === "accompagnant" ? translations[language].documentsEmojiAccompagnant : translations[language].documentsEmojiAccompagne}
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                      {userRole === "accompagnant"
                          ? translations[language].documentsQuestion
                          : translations[language].documentsQuestionUser}
                    </h2>
                      <p className="text-neutral-500 text-sm">{translations[language].selectMultiple}</p>
                  </div>

                    <div className="space-y-3 mb-6">
                    {documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedDocuments.includes(doc.id) 
                              ? 'bg-primary-50 border-primary-300' 
                              : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                          onClick={() => toggleDocument(doc.id)}
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              selectedDocuments.includes(doc.id)
                                ? 'bg-primary-500 border-primary-500 text-white' 
                                : 'border-neutral-300 bg-white'
                            }`}>
                              {selectedDocuments.includes(doc.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          </div>
                          <label className="text-sm text-neutral-800 cursor-pointer select-none flex-1">
                            {doc.label}
                        </label>
                      </div>
                    ))}
                  </div>

                    <div className="flex justify-between pt-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep("intro")}
                        className={BUTTON_STYLES.navigation.prev}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        <span>{translations[language].previous}</span>
                    </button>
                    <button
                        className={BUTTON_STYLES.navigation.next}
                      onClick={() => setCurrentStep("birthdate")}
                    >
                      <span>{translations[language].continue}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "birthdate" && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                <div className="w-full max-w-md">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                        {userRole === "accompagnant" ? translations[language].birthdateEmojiAccompagnant : translations[language].birthdateEmojiAccompagne}
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                      {userRole === "accompagnant"
                        ? translations[language].birthDateQuestion
                        : translations[language].birthDateQuestionUser}
                    </h2>
                      <p className="text-neutral-500 text-sm">{translations[language].birthDateHelp}</p>
                  </div>

                    <div className="space-y-5">
                      <div className="relative">
                        <label htmlFor="birthdate" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          {translations[language].birthDate}
                        </label>
                    <input
                          id="birthdate"
                      type="text"
                      value={birthdate}
                      onChange={(e) => {
                        setBirthdate(e.target.value)
                        if (birthdateError) setBirthdateError("")
                      }}
                      placeholder={translations[language].birthDateFormat}
                          className="w-full border border-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white text-neutral-800 shadow-sm text-sm transition-all text-center"
                      aria-label={translations[language].birthDate}
                    />
                        {birthdateError && (
                          <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                            {birthdateError === "Format invalide. Utilisez JJ/MM/AAAA" ? translations[language].invalidFormat : birthdateError}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-4 gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep("documents")}
                          className={BUTTON_STYLES.navigation.prev}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                          <span>{translations[language].previous}</span>
                      </button>
                      <button
                          className={BUTTON_STYLES.navigation.next}
                        onClick={handleBirthdateSubmit}
                      >
                        <span>{translations[language].validate}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                      </div>
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
      {/* Layout principal avec 2 colonnes quand utilisateur est "accompagné" */}
      <div className="w-full flex">
        {/* Sidebar d'historique pour utilisateurs accompagnés - maintenant partie intégrante du layout */}
        {userRole === "accompagne" && (
          <div className="w-80 min-w-80 h-screen bg-white border-r border-neutral-200 shadow-md flex flex-col z-10">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
        {translations[language].history}
      </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {allConversations.length > 0 ? (
                <>
                  {allConversations
                    .sort((a, b) => b.lastActivity - a.lastActivity)
                    .map((conv) => (
                      <div key={conv.id} className="group relative">
                        <button
                          onClick={() => {
                            // Charger cette conversation
                            setActiveConversationId(conv.id);
                            setMessages(conv.sessionData.messages);
                            setHistory(conv.sessionData.history);
                            setCurrentStep(conv.sessionData.currentStep);
                            setUserRole(conv.sessionData.userRole);
                            setSelectedCategory(conv.sessionData.selectedCategory);
                            setUserAnswers(conv.sessionData.userAnswers);
                            setCurrentQuestionIndex(conv.sessionData.currentQuestionIndex);
                            setEmail(conv.sessionData.email);
                            setBirthdate(conv.sessionData.birthdate);
                          }}
                          className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                            activeConversationId === conv.id
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800'
                              : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                            activeConversationId === conv.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {conv.name}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {new Date(conv.lastActivity).toLocaleDateString()} à {new Date(conv.lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </button>
                        
                        {/* Conteneur des boutons d'action avec une meilleure position */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          {/* Bouton d'édition */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = window.prompt(translations[language].renameConversationPrompt, conv.name);
                              if (newName && newName.trim()) {
                                // Mettre à jour le nom de la conversation
                                const updatedConversations = allConversations.map(c => 
                                  c.id === conv.id ? {...c, name: newName.trim()} : c
                                );
                                setAllConversations(updatedConversations);
                                
                                // Mettre à jour dans localStorage
                                const storageData: AppStorage = {
                                  conversations: updatedConversations,
                                  activeConversationId
                                };
                                localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(storageData));
                              }
                            }}
                            className="p-2 bg-white rounded-full hover:bg-blue-50 text-neutral-500 hover:text-blue-600 transition-all shadow-sm mx-1"
                            title={translations[language].renameConversationPrompt.split(':')[0]} // Utiliser la première partie comme titre
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          
                          {/* Bouton de suppression */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // au lieu de window.confirm, on prépare la modale
                              setConversationToDeleteId(conv.id);
                              setShowDeleteConfirmModal(true);
                            }}
                            className="p-2 bg-white rounded-full hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-all shadow-sm mx-1"
                            title={translations[language].delete}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  <p className="text-sm text-center">{translations[language].noConversations}</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-neutral-200">
              <button
                onClick={() => {
                  handleGoHome();
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                {translations[language].newConversation}
              </button>
            </div>
          </div>
        )}

        {/* Main Content - ajustement de la largeur en fonction du rôle utilisateur */}
        <div className={`${userRole === "accompagne" ? 'flex-1' : 'w-full'} flex flex-col overflow-hidden`}>
        {/* Header dynamique modernisé */}
        <header className="border-b border-neutral-200/70 py-3 px-4 bg-white backdrop-blur-sm bg-white/90 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <button
            onClick={handleGoHome}
            className="text-lg font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200 flex items-center gap-2.5"
            title={translations[language].goHomeTitle}
          >
            <div className="bg-primary-50 p-1.5 rounded-lg">
              <Image src="/placeholder.svg?height=28&width=28" alt="Logo Triptek" width={28} height={28} className="rounded-md" />
            </div>
            <span className="relative">
            {translations[language].assistantName}
              <span className="absolute -top-1 -right-6 text-[10px] text-primary-500 font-medium bg-primary-50 py-0.5 px-1 rounded">{translations[language].beta}</span>
            </span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Bouton de changement de langue */}
            <button
              onClick={toggleLanguage}
              className="text-sm text-neutral-600 hover:text-primary-600 transition-colors flex items-center gap-1.5 border border-neutral-200 py-1.5 px-3 rounded-full hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m12.5 8-4 8h7.5" />
                <path d="M8 16h7.5" />
                <path d="m11 8-3 4" />
                <path d="m15 12 3-4" />
              </svg>
              {translations[language].changeLanguage}
            </button>
            
            {/* Le bouton d'historique a été supprimé puisque l'historique est maintenant toujours visible */}
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-neutral-600 hover:text-primary-600 transition-colors flex items-center gap-1.5 border border-neutral-200 py-1.5 px-3 rounded-full hover:bg-neutral-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                {translations[language].categories}
              </button>
            )}
            <button
              onClick={handleGoHome}
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-600 transition-colors border border-neutral-200 py-1.5 px-3 rounded-full hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              {translations[language].newConversation}
            </button>
          </div>
        </header>

        <main ref={chatContainerRef} className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth bg-neutral-50">
          {!selectedCategory ? (
            // Affichage des catégories amélioré
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 my-4">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2 text-center">{translations[language].helpToday}</h1>
              <p className="text-neutral-600 mb-8 text-center">
                {translations[language].selectDomain}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-neutral-200 rounded-xl p-5 flex flex-col items-center bg-neutral-50 hover:bg-white hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-4">
                    {typeof category.icon === 'string' ? (
                        <span className="text-3xl">{category.icon}</span>
                      ) : (
                        <Image 
                          src={category.icon.src} 
                          alt={category.icon.alt} // Conserver alt pour l'accessibilité, même si non traduit dynamiquement
                          width={48} 
                          height={48} 
                          className="rounded-md" 
                        />
                      )}
                    </div>
                    <h3 className="font-medium text-neutral-800 text-lg mb-1">{category.id === 'sante' ? translations[language].healthCategoryTitle : category.title}</h3>
                    <p className="text-sm text-neutral-500 text-center leading-relaxed">{category.id === 'sante' ? translations[language].healthCategoryDescription : category.description}</p>
                    
                    <div className="mt-4 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 py-1 px-2.5 rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        {translations[language].select}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Catégorie vide "Prochainement" pour équilibrer la grille */}
                <div className="border border-dashed border-neutral-200 rounded-xl p-5 flex flex-col items-center bg-neutral-50 text-neutral-400">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔜</span>
                  </div>
                  <h3 className="font-medium text-neutral-400 text-lg mb-1">{translations[language].comingSoonTitle}</h3>
                  <p className="text-sm text-neutral-400 text-center leading-relaxed">{translations[language].comingSoonDesc}</p>
                </div>
              </div>
            </div>
          ) : (
            // Affichage du chat amélioré
            <div className="max-w-3xl mx-auto w-full">
              {/* Header de conversation */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>
                  </div>
                  <div>
                    <h2 className="font-medium text-neutral-900">{translations[language].conversationWithAssistant}</h2>
                    <p className="text-xs text-neutral-500">{translations[language].category} {categories.find(c => c.id === selectedCategory)?.title || translations[language].healthCategoryTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100"
                >
                  {translations[language].changeCategory}
                </button>
              </div>

              <div className="space-y-5">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2 animate-fadeIn">
                    <div className={`flex ${message.sender === "assistant" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`p-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-[75%] ${
                          message.sender === "assistant"
                            ? "bg-white text-neutral-800 rounded-bl-none border border-neutral-100"
                            : "bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-br-none"
                        }`}
                      >
                        {message.sender === "assistant" && (
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white mr-2 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                            </div>
                            <span className="font-medium text-xs uppercase tracking-wide text-neutral-700">{translations[language].assistantLabel}</span>
                          </div>
                        )}
                        <div className={`text-sm leading-relaxed ${message.sender === "assistant" ? "text-neutral-700" : "text-white"}`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ...markdownComponents,
                              h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => 
                                <h3 className={`text-lg font-semibold mt-6 pt-3 border-t ${message.sender === "assistant" ? "border-neutral-200" : "border-blue-400"} mb-2`} {...props} />,
                              a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => 
                                <a className={`${message.sender === "assistant" ? "text-blue-600" : "text-blue-200"} hover:underline`} 
                                   target="_blank" rel="noopener noreferrer" {...props} />,
                              ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => 
                                <ul className="list-disc list-inside space-y-1 my-2 ml-1" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <span className={`text-[10px] mt-2 block ${
                          message.sender === 'assistant' ? 'text-neutral-400' : 'text-white/70'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>

                    {message.showButtons && message.buttons && (
                      <div className="flex flex-wrap justify-start gap-2 pt-2 pl-10">
                        {message.buttons.map((button) => (
                          <button
                            key={button.id}
                            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                              button.id === "faire-demarche"
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-sm"
                                : button.id === "sources"
                                  ? "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm"
                                  : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm"
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
                      <div className="flex flex-wrap justify-start gap-2 pt-3 pl-10">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            className="rounded-lg px-3.5 py-1.5 text-sm font-medium bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-150 flex items-center gap-1.5 shadow-sm"
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
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm bg-white text-neutral-800 rounded-bl-none border border-neutral-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white mr-2 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                       </div>
                        <span className="font-medium text-xs uppercase tracking-wide text-neutral-700">{translations[language].assistantLabel}</span>
                       </div>
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm text-neutral-500">{translations[language].searchingInfo}</span>
                      </div>
                     </div>
                  </div>
                )}
                
                {/* Invisible element pour auto scroll */}
                <div id="chat-end" className="h-4"></div>
              </div>
            </div>
          )}
        </main>

        {/* Zone de saisie améliorée */}
        <div className="border-t border-neutral-100 py-4 px-4 bg-gradient-to-r from-indigo-50/30 to-blue-50/30 backdrop-blur-md">
          <form onSubmit={(e) => { e.preventDefault(); handleQuestionSubmit(); }} className="max-w-3xl mx-auto">
            <div className="relative bg-white border border-indigo-100 rounded-xl shadow-lg shadow-indigo-100/20 p-1 flex items-center group hover:border-indigo-200 transition-all">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={translations[language].askQuestion}
                className="flex-1 pl-4 pr-4 py-3.5 bg-transparent text-neutral-800 placeholder-neutral-500 focus:outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && question.trim()) {
                    e.preventDefault();
                    handleQuestionSubmit();
                  }
                }}
              />
              {question.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestion("")}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                  title={translations[language].clearText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            <button
              type="submit"
                className="ml-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg px-5 py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              disabled={!question.trim() || isLoading}
                title={translations[language].send}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  <>
                    <span className="hidden sm:inline font-medium">{translations[language].send}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </>
              )}
            </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M18 16v6"/><path d="M18 22H6"/><path d="M6 10v6"/><path d="M3 6a9 9 0 0 1 9-3"/><path d="M21 6a9 9 0 0 0-9-3"/><path d="M12 3v9"/></svg>
              <div className="text-[11px] text-indigo-500 font-medium">
                {translations[language].enterToSend}
              </div>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{translations[language].confirmDeletion}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {translations[language].deleteConfirmText}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {translations[language].cancel}
              </button>
              <button
                onClick={() => {
                  // Fonction de suppression inline
                  if (!conversationToDeleteId) return;

                  const updatedConversations = allConversations.filter(c => c.id !== conversationToDeleteId);
                  setAllConversations(updatedConversations);

                  let newActiveId = activeConversationId;
                  if (activeConversationId === conversationToDeleteId) {
                    if (updatedConversations.length > 0) {
                      // Si des conversations existent, rendre la plus récente active
                      const sortedConversations = [...updatedConversations].sort((a, b) => b.lastActivity - a.lastActivity);
                      newActiveId = sortedConversations[0].id;
                      // Charger la session de la nouvelle conversation active
                      const activeConv = sortedConversations[0];
                      setMessages(activeConv.sessionData.messages);
                      setHistory(activeConv.sessionData.history);
                      setCurrentStep(activeConv.sessionData.currentStep);
                      setUserRole(activeConv.sessionData.userRole);
                      setSelectedCategory(activeConv.sessionData.selectedCategory);
                      setUserAnswers(activeConv.sessionData.userAnswers);
                      setCurrentQuestionIndex(activeConv.sessionData.currentQuestionIndex);
                      setEmail(activeConv.sessionData.email);
                      setBirthdate(activeConv.sessionData.birthdate);
                    } else {
                      // S'il n'y a plus de conversations, réinitialiser à un état propre
                      // et créer une nouvelle conversation par défaut pour l'utilisateur
                      newActiveId = createNewConversation([]); // Crée une nouvelle conversation et la rend active
                    }
                  }
                  setActiveConversationId(newActiveId);

                  // Mettre à jour dans localStorage
                  const deleteStorageData: AppStorage = {
                    conversations: updatedConversations,
                    activeConversationId: newActiveId,
                  };
                  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(deleteStorageData));

                  setShowDeleteConfirmModal(false);
                  setConversationToDeleteId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                {translations[language].delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}