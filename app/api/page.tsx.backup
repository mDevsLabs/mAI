"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Key,
  Copy,
  Check,
  Play,
  User,
  Shield,
  Terminal,
  Code,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Globe,
  AlertCircle,
  Trash2,
  Plus,
  LogOut,
  LogIn,
  CheckCircle2,
  Layers,
} from "lucide-react";

// Types
interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  status: "active" | "revoked";
  maxUsage: number;
  usageCount: number;
  note: string;
  shownOnce: boolean;
  plan?: "gratuit" | "pro" | "entreprise";
  ipRestriction?: string;
  domainRestriction?: string;
}

interface UserAccount {
  email: string;
  isLoggedIn: boolean;
}

interface EndpointChoice {
  id: string;
  method: "GET" | "POST";
  path: string;
  name: string;
  description: string;
  defaultBody?: string;
}

// Liste des endpoints de l'API v1
const ENDPOINTS: EndpointChoice[] = [
  {
    id: "get-models",
    method: "GET",
    path: "/v1/models",
    name: "GET /v1/models",
    description: "Liste tous les modèles IA disponibles",
  },
  {
    id: "chat-completions",
    method: "POST",
    path: "/v1/chat/completions",
    name: "POST /v1/chat/completions",
    description: "Génère une réponse textuelle de chat",
    defaultBody: JSON.stringify(
      {
        model: "mai-1",
        messages: [
          { role: "system", content: "Vous êtes un assistant IA utile." },
          { role: "user", content: "Bonjour ! Présente-toi rapidement." },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      null,
      2
    ),
  },
  {
    id: "get-model-detail",
    method: "GET",
    path: "/v1/models/mai-1",
    name: "GET /v1/models/mai-1",
    description: "Obtient les métadonnées détaillées du modèle mAI-1",
  },
  {
    id: "get-model-detail-light",
    method: "GET",
    path: "/v1/models/mai-1-light",
    name: "GET /v1/models/mai-1-light",
    description: "Obtient les métadonnées détaillées du modèle mAI-1-Light",
  },
  {
    id: "get-model-detail-12-light",
    method: "GET",
    path: "/v1/models/mai-1.2-light",
    name: "GET /v1/models/mai-1.2-light",
    description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Light",
  },
  {
    id: "get-model-detail-12-apex",
    method: "GET",
    path: "/v1/models/mai-1.2-apex",
    name: "GET /v1/models/mai-1.2-apex",
    description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Apex",
  },
  {
    id: "get-model-detail-12-opal",
    method: "GET",
    path: "/v1/models/mai-1.2-opal",
    name: "GET /v1/models/mai-1.2-opal",
    description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Opal",
  },
  {
    id: "create-embeddings",
    method: "POST",
    path: "/v1/embeddings",
    name: "POST /v1/embeddings",
    description: "Génère des embeddings vectoriels pour un texte donné",
    defaultBody: JSON.stringify(
      {
        model: "text-embedding-mai",
        input: "mDevsLabs est une équipe passionnée d'intelligence artificielle.",
      },
      null,
      2
    ),
  },
  {
    id: "content-moderation",
    method: "POST",
    path: "/v1/moderations",
    name: "POST /v1/moderations",
    description: "Vérifie si un contenu respecte les règles de sécurité",
    defaultBody: JSON.stringify(
      {
        input: "Ceci est un exemple de texte à modérer.",
      },
      null,
      2
    ),
  },
];

// Générateur de clé unique au format exact : mp-[10 caractères alphanumériques]-[5 chiffres]
function generateApiKeyString(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let alpha = "";
  for (let i = 0; i < 10; i++) {
    alpha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  return `mp-${alpha}-${digits}`;
}

export default function ApiPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<UserAccount>({ email: "", isLoggedIn: false });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<{ [id: string]: boolean }>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Formulaire auth (Email / Password)
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Clé pour nouvelle création
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyMaxUsage, setNewKeyMaxUsage] = useState(1000);
  const [newKeyNote, setNewKeyNote] = useState("");
  const [newKeyPlan, setNewKeyPlan] = useState<"gratuit" | "pro" | "entreprise">("gratuit");
  const [newKeyIp, setNewKeyIp] = useState("");
  const [newKeyDomain, setNewKeyDomain] = useState("");

  useEffect(() => {
    if (newKeyPlan === "gratuit") setNewKeyMaxUsage(1000);
    else if (newKeyPlan === "pro") setNewKeyMaxUsage(50000);
    else if (newKeyPlan === "entreprise") setNewKeyMaxUsage(250000);
  }, [newKeyPlan]);

  // Playground States
  const [playgroundKey, setPlaygroundKey] = useState("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(ENDPOINTS[0].id);
  const [requestBody, setRequestBody] = useState<string>("");
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [responseStatus, setResponseStatus] = useState<{ code: number; text: string; time?: number } | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);

  // Documentation tab
  const [docTab, setDocTab] = useState<"curl" | "javascript" | "python">("curl");
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Initialisation au chargement côté client
  useEffect(() => {
    setIsHydrated(true);

    // Charger l'utilisateur
    const storedUser = localStorage.getItem("mprojects_api_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur lecture utilisateur:", e);
      }
    }

    // Charger les clés API
    const storedKeys = localStorage.getItem("mprojects_api_keys");
    let keysList: ApiKey[] = [];
    if (storedKeys) {
      try {
        const parsedKeys = JSON.parse(storedKeys);
        keysList = parsedKeys.map((k: ApiKey) => ({
          ...k,
          maxUsage: k.maxUsage ?? 1000,
          usageCount: k.usageCount ?? 0,
          note: k.note ?? "",
          shownOnce: k.shownOnce ?? false,
          plan: k.plan ?? "gratuit",
          ipRestriction: k.ipRestriction ?? "",
          domainRestriction: k.domainRestriction ?? "",
        }));
      } catch (e) {
        console.error("Erreur lecture clés API:", e);
      }
    }

    // Si aucune clé n'existe, en créer une par défaut pour l'expérience démo
    if (keysList.length === 0) {
      const defaultKey: ApiKey = {
        id: "key-demo-1",
        key: generateApiKeyString(),
        name: "Clé de démonstration",
        createdAt: new Date().toLocaleDateString("fr-FR"),
        status: "active",
        maxUsage: 1000,
        usageCount: 0,
        note: "Clé générée automatiquement lors de la première visite",
        shownOnce: false,
        plan: "gratuit",
        ipRestriction: "",
        domainRestriction: "",
      };
      keysList = [defaultKey];
      localStorage.setItem("mprojects_api_keys", JSON.stringify(keysList));
    }

    setApiKeys(keysList);

    // Préremplir la clé du playground avec la première clé active si dispo
    const activeKey = keysList.find((k) => k.status === "active");
    if (activeKey) {
      setPlaygroundKey(activeKey.key);
    }
  }, []);

  // Mettre à jour le body par défaut lorsque l'endpoint change
  useEffect(() => {
    const ep = ENDPOINTS.find((e) => e.id === selectedEndpointId);
    if (ep && ep.defaultBody) {
      setRequestBody(ep.defaultBody);
    } else {
      setRequestBody("");
    }
  }, [selectedEndpointId]);

  // Sauvegarder dans localStorage
  const saveKeysToStorage = (updatedKeys: ApiKey[]) => {
    setApiKeys(updatedKeys);
    localStorage.setItem("mprojects_api_keys", JSON.stringify(updatedKeys));
  };

  // Gestion Connexion / Inscription
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Veuillez remplir tous les champs.");
      return;
    }
    if (passwordInput.length < 4) {
      setAuthError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    const updatedUser: UserAccount = { email: emailInput, isLoggedIn: true };
    setUser(updatedUser);
    localStorage.setItem("mprojects_api_user", JSON.stringify(updatedUser));
    setAuthError("");

    // Générer une clé API initiale pour cet utilisateur s'il n'en a pas sous son nom
    const newKeyStr = generateApiKeyString();
    const newKeyObj: ApiKey = {
      id: `key-${Date.now()}`,
      key: newKeyStr,
      name: `Clé principale (${emailInput.split("@")[0]})`,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      status: "active",
      maxUsage: 1000,
      usageCount: 0,
      note: "",
      shownOnce: false,
    };
    const updatedKeys = [newKeyObj, ...apiKeys];
    saveKeysToStorage(updatedKeys);
    setPlaygroundKey(newKeyStr);
    setEmailInput("");
    setPasswordInput("");
  };

  const handleLogout = () => {
    const updatedUser = { email: "", isLoggedIn: false };
    setUser(updatedUser);
    localStorage.removeItem("mprojects_api_user");
  };

  // Création d'une clé API supplémentaire
  const handleGenerateKey = () => {
    const keyStr = generateApiKeyString();
    const keyName = newKeyName.trim() || `Clé API #${apiKeys.length + 1}`;
    const newKeyObj: ApiKey = {
      id: `key-${Date.now()}`,
      key: keyStr,
      name: keyName,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      status: "active",
      maxUsage: newKeyMaxUsage,
      usageCount: 0,
      note: newKeyNote.trim(),
      shownOnce: false,
      plan: newKeyPlan,
      ipRestriction: newKeyIp.trim(),
      domainRestriction: newKeyDomain.trim(),
    };
    const updatedKeys = [newKeyObj, ...apiKeys];
    saveKeysToStorage(updatedKeys);
    setNewKeyName("");
    setNewKeyMaxUsage(1000);
    setNewKeyNote("");
    setNewKeyPlan("gratuit");
    setNewKeyIp("");
    setNewKeyDomain("");
    toast.success(`Clé API "${keyName}" créée avec succès !`, { icon: "🔐" });
    setPlaygroundKey(keyStr);
  };

  // Révocation d'une clé API
  const handleRevokeKey = (id: string) => {
    const keyToRevoke = apiKeys.find((k) => k.id === id);
    if (!keyToRevoke) return;
    
    // Fermer les toasts de confirmation précédents pour éviter le cumul
    toast.dismiss();
    
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>
            Révoquer la clé <strong>{keyToRevoke.name}</strong> ?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const updatedKeys = apiKeys.map((k) =>
                  k.id === id ? { ...k, status: "revoked" as const } : k
                );
                saveKeysToStorage(updatedKeys);
                toast.success(`Clé "${keyToRevoke.name}" révoquée`, { id: t.id });
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Oui, révoquer
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  // Basculer la visibilité d'une clé avec gestion de la sécurité
  const toggleKeyVisibility = (id: string) => {
    const key = apiKeys.find((k) => k.id === id);
    if (!key) return;

    if (key.shownOnce && !visibleKeys[id]) {
      toast.error("Par mesure de sécurité, cette clé API ne peut plus être affichée car elle a déjà été révélée par le passé.", {
        icon: "🔒",
      });
      return;
    }

    setVisibleKeys((prev) => {
      const isNowVisible = !prev[id];
      if (isNowVisible && !key.shownOnce) {
        const updatedKeys = apiKeys.map((k) =>
          k.id === id ? { ...k, shownOnce: true } : k
        );
        setTimeout(() => saveKeysToStorage(updatedKeys), 0);
      }
      return { ...prev, [id]: isNowVisible };
    });
  };

  // Copier une clé API
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Copier la doc
  const copyDocCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  // Masquer la clé avec astérisques pour la sécurité UI
  const maskKey = (keyStr: string) => {
    const parts = keyStr.split("-");
    if (parts.length === 3) {
      return `${parts[0]}-••••••••••-${parts[2]}`;
    }
    return "mp-••••••••••-•••••";
  };

  // Exécution du test Playground
  const handleRunPlaygroundRequest = () => {
    setIsLoadingRequest(true);
    setResponseStatus(null);
    setResponseData(null);

    const ep = ENDPOINTS.find((e) => e.id === selectedEndpointId) || ENDPOINTS[0];
    const startTime = Date.now();

    setTimeout(() => {
      const cleanKey = playgroundKey.trim();

      // Vérification de la clé dans les clés enregistrées dans localStorage
      const matchingKey = apiKeys.find(
        (k) => k.key === cleanKey && k.status === "active"
      );

      const responseDuration = Date.now() - startTime + Math.floor(Math.random() * 40 + 20);

      if (!cleanKey || !matchingKey) {
        // HTTP 401 Unauthorized - Erreur exacte exigée
        setResponseStatus({ code: 401, text: "401 Unauthorized", time: responseDuration });
        setResponseData(
          JSON.stringify(
            {
              error: {
                message: "Clé API invalide ou manquante.",
                type: "invalid_request_error",
                code: "invalid_api_key",
              },
            },
            null,
            2
          )
        );
      } else if (matchingKey.usageCount >= matchingKey.maxUsage) {
        // Usage limit reached
        const updatedKeys = apiKeys.map((k) =>
          k.id === matchingKey.id ? { ...k, status: "revoked" as const } : k
        );
        saveKeysToStorage(updatedKeys);
        toast.error(`Limite d'utilisation atteinte pour "${matchingKey.name}". La clé a été révoquée.`, { icon: "⚠️" });
        setResponseStatus({ code: 429, text: "429 Usage Limit Exceeded", time: responseDuration });
        setResponseData(
          JSON.stringify(
            {
              error: {
                message: "Limite d'utilisation dépassée. Cette clé a été révoquée.",
                type: "usage_limit_error",
                code: "usage_limit_exceeded",
              },
            },
            null,
            2
          )
        );
      } else {
        // Increment usage count
        const updatedKeys = apiKeys.map((k) =>
          k.id === matchingKey.id ? { ...k, usageCount: k.usageCount + 1 } : k
        );
        saveKeysToStorage(updatedKeys);
        
        // HTTP 200 OK - Réponses JSON réalistes et dynamiques pour les 10 endpoints
        setResponseStatus({ code: 200, text: "200 OK", time: responseDuration });

        let resultJson: Record<string, unknown> = {};

        switch (ep.id) {
          case "get-models":
            resultJson = {
              object: "list",
              data: [
                {
                  id: "mai-1.2-light",
                  object: "model",
                  created: 1753228800,
                  owned_by: "mDevsLabs",
                  permission: [],
                  root: "mai-1.2-light",
                  parent: null,
                  meta: {
                    series: "mAI-1.2",
                    context_window: 262144,
                    vision: true,
                  },
                },
                {
                  id: "mai-1.2-apex",
                  object: "model",
                  created: 1753228800,
                  owned_by: "mDevsLabs",
                  permission: [],
                  root: "mai-1.2-apex",
                  parent: null,
                  meta: {
                    series: "mAI-1.2",
                    context_window: 262144,
                    vision: true,
                  },
                },
                {
                  id: "mai-1.2-opal",
                  object: "model",
                  created: 1753228800,
                  owned_by: "mDevsLabs",
                  permission: [],
                  root: "mai-1.2-opal",
                  parent: null,
                  meta: {
                    series: "mAI-1.2",
                    context_window: 262144,
                    vision: true,
                  },
                },
                {
                  id: "mai-1",
                  object: "model",
                  created: 1720656000,
                  owned_by: "mDevsLabs",
                  permission: [],
                  root: "mai-1",
                  parent: null,
                  meta: {
                    architecture: "Gemma 4 12B Unified",
                    context_window: 262144,
                    vision: true,
                  },
                },
                {
                  id: "mai-1-light",
                  object: "model",
                  created: 1720656000,
                  owned_by: "mDevsLabs",
                  permission: [],
                  root: "mai-1-light",
                  parent: null,
                  meta: {
                    architecture: "IBM Granite 4.1 3B",
                    context_window: 131072,
                    vision: false,
                  },
                },
              ],
            };
            break;

          case "chat-completions":
            resultJson = {
              id: `chatcmpl-${Math.random().toString(36).substring(2, 12)}`,
              object: "chat.completion",
              created: Math.floor(Date.now() / 1000),
              model: "mai-1",
              choices: [
                {
                  index: 0,
                  message: {
                    role: "assistant",
                    content:
                      "Bonjour ! Je suis mAI-1, le modèle d'intelligence artificielle développé par mDevsLabs. Je suis prêt à vous assister pour le code, la rédaction et le raisonnement multimodal.",
                  },
                  finish_reason: "stop",
                },
              ],
              usage: {
                prompt_tokens: 28,
                completion_tokens: 42,
                total_tokens: 70,
              },
            };
            break;

          case "get-model-detail":
            resultJson = {
              id: "mai-1",
              object: "model",
              created: 1720656000,
              owned_by: "mDevsLabs",
              description:
                "Assistant IA multimodal 12B paramètres propulsé par Google Gemma 4 12B Unified.",
              status: "active",
              capabilities: {
                chat: true,
                vision: true,
                function_calling: true,
                json_mode: true,
              },
              context_window: 262144,
            };
            break;

          case "get-model-detail-light":
            resultJson = {
              id: "mai-1-light",
              object: "model",
              created: 1720656000,
              owned_by: "mDevsLabs",
              description:
                "Assistant IA local ultraléger et rapide 3B paramètres propulsé par IBM Granite 4.1 3B.",
              status: "active",
              capabilities: {
                chat: true,
                vision: false,
                function_calling: true,
                json_mode: true,
              },
              context_window: 131072,
            };
            break;

          case "get-model-detail-12-light":
            resultJson = {
              id: "mai-1.2-light",
              object: "model",
              created: 1753228800,
              owned_by: "mDevsLabs",
              description:
                "Assistant IA local ultra-rapide et multimodal 3B paramètres. Vision intégrée, légèreté maximale et productivité au quotidien.",
              status: "active",
              series: "mAI-1.2",
              capabilities: {
                chat: true,
                vision: true,
                function_calling: true,
                json_mode: true,
              },
              context_window: 262144,
            };
            break;

          case "get-model-detail-12-apex":
            resultJson = {
              id: "mai-1.2-apex",
              object: "model",
              created: 1753228800,
              owned_by: "mDevsLabs",
              description:
                "Le top tier de la famille mAI. 9B paramètres, vision multimodale, raisonnement avancé et RAG lourd — zéro cloud.",
              status: "active",
              series: "mAI-1.2",
              capabilities: {
                chat: true,
                vision: true,
                function_calling: true,
                json_mode: true,
              },
              context_window: 262144,
            };
            break;

          case "get-model-detail-12-opal":
            resultJson = {
              id: "mai-1.2-opal",
              object: "model",
              created: 1753228800,
              owned_by: "mDevsLabs",
              description:
                "Le sweet spot parfait de la série mAI-1.2. 33B paramètres, multimodal, fluide et équilibré pour toutes vos tâches.",
              status: "active",
              series: "mAI-1.2",
              capabilities: {
                chat: true,
                vision: true,
                function_calling: true,
                json_mode: true,
              },
              context_window: 262144,
            };
            break;

          case "create-embeddings":
            resultJson = {
              object: "list",
              data: [
                {
                  object: "embedding",
                  index: 0,
                  embedding: Array.from({ length: 8 }, () => parseFloat((Math.random() * 2 - 1).toFixed(6))),
                }
              ],
              model: "text-embedding-mai",
              usage: {
                prompt_tokens: 12,
                total_tokens: 12,
              }
            };
            break;

          case "content-moderation":
            resultJson = {
              id: `modr-${Math.random().toString(36).substring(2, 12)}`,
              model: "text-moderation-mai",
              results: [
                {
                  flagged: false,
                  categories: {
                    sexual: false,
                    hate: false,
                    harassment: false,
                    self_harm: false,
                    violence: false,
                  },
                  category_scores: {
                    sexual: 0.0001,
                    hate: 0.0002,
                    harassment: 0.0003,
                    self_harm: 0.0001,
                    violence: 0.0005,
                  }
                }
              ]
            };
            break;

          default:
            resultJson = { status: "success", message: "Requête exécutée avec succès." };
        }

        setResponseData(JSON.stringify(resultJson, null, 2));
      }

      setIsLoadingRequest(false);
    }, 450);
  };

  // Exemples de code dynamiques pour la doc
  const getDynamicCodeExamples = () => {
    const activeEndpoint = ENDPOINTS.find((e) => e.id === selectedEndpointId) || ENDPOINTS[0];
    const key = playgroundKey || "mp-k9x2m7p1q4-84920";
    const method = activeEndpoint.method;
    const url = `https://mprojects-officiel.vercel.app/api${activeEndpoint.path}`;
    const hasBody = method === "POST";

    return {
      curl: `curl -X ${method} ${url} \\
  -H "Authorization: Bearer ${key}"${hasBody ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.trim().replace(/'/g, "'\\''")}'` : ""}`,
      javascript: `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer ${key}"${hasBody ? `,\n    "Content-Type": "application/json"` : ""}
  }${hasBody ? `,\n  body: JSON.stringify(${requestBody.trim()})` : ""}
});

const data = await response.json();
console.log(data);`,
      python: `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer ${key}"${hasBody ? `,\n    "Content-Type": "application/json"` : ""}
}
${hasBody ? `payload = ${requestBody.trim()}\nresponse = requests.post(url, headers=headers, json=payload)` : `response = requests.get(url, headers=headers)`}

print(response.json())`,
    };
  };

  const codeExamples = getDynamicCodeExamples();

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-12">
      {/* Hero Section */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" /> Console Développeur & API v1
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          API <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            mProjects
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-3xl"
        >
          Accédez à la puissance de nos modèles de langage et de vision via notre API haute performance. Intégrez facilement la série <strong>mAI-1.2</strong> (Light, Apex, Opal) et les modèles mAI-1 dans vos applications.
        </motion.p>
      </div>

      {/* Grid Caractéristiques API */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:border-purple-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Latence Basse</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Infrastructure optimisée offrant un temps de réponse en millisecondes et une haute disponibilité.
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:border-blue-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sécurité & Chiffrement</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Authentification par clé Bearer chiffrée, isolation stricte et conformité aux standards de sécurité.
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Standard v1 Universel</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Format d'API compatible REST standard, prêt à s'intégrer avec fetch, cURL, Python et tout client HTTP.
          </p>
        </div>
      </div>

      {/* Section Gestion Compte & Clés API */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Gestion des Clés API
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">
                Générez et révoquez vos clés d'accès sécurisées au format <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-mono">mp-[10 chars]-[5 chiffres]</code>.
              </p>
            </div>
          </div>

          {user.isLoggedIn && (
            <div className="flex items-center gap-3 bg-white/60 border border-white/80 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{user.email}</p>
                <p className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connecté
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {!user.isLoggedIn ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                Connectez-vous pour gérer vos accès
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Créez un compte développeur mProjects ou connectez-vous avec vos identifiants pour générer des clés API dédiées et suivre votre consommation.
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Information de démonstration :</strong> Des clés API d'essai sont pré-générées localement dans votre navigateur afin de vous permettre de tester immédiatement le Playground ci-dessous.
                </span>
              </div>
            </div>

            {/* Formulaire Auth */}
            <form onSubmit={handleAuthSubmit} className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" /> Espace Développeur (Inscription / Connexion)
              </h4>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-medium">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="dev@mprojects.io"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 text-slate-900 font-bold text-sm shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:bg-white/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Se connecter / Créer mon compte
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Création de nouvelle clé */}
            <div className="space-y-4 bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" /> Générer une nouvelle clé API
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la clé</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Nom de la clé"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Forfait & Quota</label>
                  <select
                    value={newKeyPlan}
                    onChange={(e) => setNewKeyPlan(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
                  >
                    <option value="gratuit">Forfait Gratuit (1 000 req/mois)</option>
                    <option value="pro">Forfait Pro (50 000 req/mois)</option>
                    <option value="entreprise">Forfait Entreprise (250 000 req/mois)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note de la clé (optionnelle)</label>
                  <input
                    type="text"
                    value={newKeyNote}
                    onChange={(e) => setNewKeyNote(e.target.value)}
                    placeholder="Ex: Production, Dev portable..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" title="Restreindre l'utilisation à cette IP">Restriction IP</label>
                    <input
                      type="text"
                      value={newKeyIp}
                      onChange={(e) => setNewKeyIp(e.target.value)}
                      placeholder="Ex: 192.168.1.1"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" title="Restreindre l'utilisation à ce domaine HTTP">Domaine autorisé</label>
                    <input
                      type="text"
                      value={newKeyDomain}
                      onChange={(e) => setNewKeyDomain(e.target.value)}
                      placeholder="Ex: *.site.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateKey}
                  className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Générer la clé sécurisée
                </button>
              </div>
            </div>

            {/* Liste des clés API */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vos clés API générées ({apiKeys.length})
              </h3>

              {apiKeys.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4">Aucune clé API enregistrée.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {apiKeys.map((k) => {
                    const isVisible = visibleKeys[k.id];
                    const isCopied = copiedKeyId === k.id;
                    const isRevoked = k.status === "revoked";
                    const isUsageLimitReached = k.usageCount >= k.maxUsage;

                    return (
                      <div
                        key={k.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                          isRevoked || isUsageLimitReached
                            ? "bg-slate-100/50 border-slate-200 opacity-60"
                            : "bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-md"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{k.name}</span>
                            {k.plan && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                k.plan === "entreprise" ? "bg-amber-500/10 text-amber-800 border border-amber-500/20" :
                                k.plan === "pro" ? "bg-blue-500/10 text-blue-800 border border-blue-500/20" :
                                "bg-slate-500/10 text-slate-700 border border-slate-500/20"
                              }`}>
                                Forfait {k.plan}
                              </span>
                            )}
                            {isRevoked ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 font-bold uppercase">
                                Révoquée
                              </span>
                            ) : isUsageLimitReached ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold uppercase">
                                Limite atteinte
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold uppercase">
                                Active
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">({k.createdAt})</span>
                          </div>
                          {k.note && (
                            <p className="text-xs text-slate-500 italic">{k.note}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Usage: {k.usageCount}/{k.maxUsage}</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 transition-width"
                                style={{ width: `${Math.min(100, (k.usageCount / k.maxUsage) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          {(k.ipRestriction || k.domainRestriction) && (
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              {k.ipRestriction && (
                                <span className="flex items-center gap-1 bg-white/40 border border-white/60 px-1.5 py-0.5 rounded">
                                  <Shield className="w-3 h-3 text-blue-500 shrink-0" /> IP : <code>{k.ipRestriction}</code>
                                </span>
                              )}
                              {k.domainRestriction && (
                                <span className="flex items-center gap-1 bg-white/40 border border-white/60 px-1.5 py-0.5 rounded">
                                  <Globe className="w-3 h-3 text-emerald-500 shrink-0" /> Domaine : <code>{k.domainRestriction}</code>
                                </span>
                              )}
                            </div>
                          )}
                          <div
                            className={`font-mono text-xs text-purple-700 font-bold tracking-wider bg-purple-50/40 border border-purple-100/60 px-3 py-1.5 rounded-xl inline-block cursor-pointer transition-all ${
                              k.shownOnce ? "cursor-not-allowed opacity-80" : "hover:bg-purple-100/50"
                            }`}
                            onClick={() => {
                              if (!k.shownOnce && !isRevoked && !isUsageLimitReached) {
                                toggleKeyVisibility(k.id);
                              } else if (k.shownOnce) {
                                toast.error("Par mesure de sécurité, cette clé API ne peut plus être affichée car elle a déjà été révélée par le passé.", {
                                  icon: "🔒",
                                });
                              }
                            }}
                            title={k.shownOnce ? "Cette clé ne peut plus être révélée" : "Cliquez pour afficher la clé"}
                          >
                            {isVisible ? k.key : maskKey(k.key)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isRevoked && !isUsageLimitReached && (
                            <button
                              onClick={() => {
                                if (k.shownOnce && !isVisible) {
                                  toast.error("Par mesure de sécurité, cette clé API ne peut plus être affichée car elle a déjà été révélée par le passé.", {
                                    icon: "🔒",
                                  });
                                } else {
                                  toggleKeyVisibility(k.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 text-slate-600 transition-colors shadow-sm cursor-pointer"
                              title={isVisible ? "Masquer la clé" : "Afficher la clé"}
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}

                          {!isRevoked && !isUsageLimitReached && (
                            <button
                              onClick={() => {
                                if (k.shownOnce && !isVisible) {
                                  toast.error("Par mesure de sécurité, vous ne pouvez pas copier cette clé car elle a déjà été révélée par le passé.", {
                                    icon: "🔒",
                                  });
                                } else {
                                  copyToClipboard(k.key, k.id);
                                  toast.success("Clé API copiée !", { icon: "📋" });
                                }
                              }}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                                isCopied
                                  ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 backdrop-blur-md shadow-sm"
                                  : "bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 text-slate-700 shadow-sm"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 animate-pulse" /> Copié !
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copier
                                </>
                              )}
                            </button>
                          )}

                          {!isRevoked && !isUsageLimitReached && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="p-2 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/20 hover:bg-red-500/20 text-red-600 transition-colors shadow-sm cursor-pointer"
                              title="Révoquer la clé"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section Zone de Test Interactive (Playground) */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200/60">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Playground / Zone de Test API Interactive
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Tester en direct les endpoints avec validation de votre clé Bearer en temps réel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulaire de Requête */}
          <div className="lg:col-span-6 space-y-4">
            {/* Clé API pour test */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Clé API Bearer</span>
                {apiKeys.length > 0 && (
                  <span className="text-[11px] text-purple-600 font-normal lowercase">
                    (Sélection rapide disponible)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playgroundKey}
                  onChange={(e) => setPlaygroundKey(e.target.value)}
                  placeholder="mp-xxxxxxxxxx-xxxxx"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-sm font-mono text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                {apiKeys.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) setPlaygroundKey(e.target.value);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none max-w-[130px]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Mes clés...
                    </option>
                    {apiKeys.map((k) => (
                      <option key={k.id} value={k.key} disabled={k.status === "revoked"}>
                        {k.name} {k.status === "revoked" ? "(Révoquée)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Menu Déroulant des Endpoints */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Endpoint API (Requêtes au Choix)
              </label>
              <select
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {ENDPOINTS.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    [{ep.method}] {ep.name} — {ep.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Corps de la Requête (si POST ou disponible) */}
            {requestBody !== "" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corps de la requête (JSON Payload)
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={7}
                  className="w-full p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-slate-800"
                />
              </div>
            )}

            {/* Bouton Envoyer */}
            <button
              onClick={handleRunPlaygroundRequest}
              disabled={isLoadingRequest}
              className="w-full py-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-slate-900 font-bold hover:bg-white/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
            >
              {isLoadingRequest ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Exécution en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-900 stroke-slate-900" /> Envoyer la Requête
                </>
              )}
            </button>
          </div>

          {/* Console de Réponse HTTP */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Réponse de la Console API
              </label>
              {responseStatus && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      responseStatus.code === 200
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    Statut : {responseStatus.text}
                  </span>
                  {responseStatus.time && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {responseStatus.time}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-x-auto min-h-[320px] max-h-[450px] shadow-inner flex flex-col justify-between">
              {responseData ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {responseData}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-8 space-y-2">
                  <Terminal className="w-10 h-10 stroke-[1.5]" />
                  <p className="text-sm font-sans">
                    Choisissez un endpoint et cliquez sur <strong>"Envoyer la requête"</strong> pour obtenir la réponse du serveur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Documentation & Exemples de Code */}
      <section className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200/60">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Documentation & Intégration Code
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Consultez l'URL de base et copiez les snippets de code prêts à l'emploi.
            </p>
          </div>
        </div>

        {/* Base URL Highlight */}
        <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                URL de base API v1
              </span>
              <code className="text-sm font-mono font-bold text-slate-900">
                https://mprojects-officiel.vercel.app/api/v1/
              </code>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-bold self-start sm:self-auto">
            HTTPS / TLS v1.3
          </span>
        </div>

        {/* Onglets de Langage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2 bg-slate-200/50 p-1 rounded-2xl">
              <button
                onClick={() => setDocTab("curl")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  docTab === "curl"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                cURL / HTTP
              </button>
              <button
                onClick={() => setDocTab("javascript")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  docTab === "javascript"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                JavaScript (fetch)
              </button>
              <button
                onClick={() => setDocTab("python")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  docTab === "python"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                Python (requests)
              </button>
            </div>

            <button
              onClick={() => copyDocCode(codeExamples[docTab])}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedDoc ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Code copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copier l'exemple
                </>
              )}
            </button>
          </div>

          {/* Block Code */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
            <pre className="leading-relaxed">{codeExamples[docTab]}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
