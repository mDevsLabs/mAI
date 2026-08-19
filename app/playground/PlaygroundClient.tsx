'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Trash2,
  SlidersHorizontal,
  Bot,
  
  Gauge,
  Zap,
  Eye,
  EyeOff,
  Image as 
  X,
  
  
  
  
  RefreshCw,
  
  FileText,
  
  
  KeyRound,
  ChevronDown,
  Columns,
  Plus,
  ThumbsUp,
  ThumbsDown,
  
  Download} from 'lucide-react';
import { ModelInfo } from '@/lib/models';
import { Message, PlaygroundConfig } from '@/lib/playground-types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { maiModelsList } from '@/maiModels';
import { openRouterModels } from '@/lib/ai-models';
import Link from 'next/link';

interface UserKeyItem {
  id: string;
  name: string;
  prefix: string;
  key?: string;
}

interface ModelComparisonState {
  modelTag: string;
  content: string;
  isStreaming: boolean;
  tokens: number;
  tokensPerSec: number;
  latencyMs: number;
  rating?: 'up' | 'down' | null;
  error?: string | null;
}

const SYSTEM_PROMPT_PRESETS = [
  { label: '🤖 Assistant Général', prompt: 'Tu es un assistant IA local rapide, utile, précis et concis.' },
  { label: '💻 Expert Code & Debug', prompt: 'Tu es un développeur Senior expert. Réponds en fournissant du code propre, moderne, commenté et optimisé.' },
  { label: '✍️ Rédaction & Style', prompt: 'Tu es un expert en rédaction et en communication. Rédige un contenu élégant, structuré et captivant.' },
  { label: '📊 Format JSON Strict', prompt: 'Tu es un formateur de données. Réponds EXCLUSIVEMENT sous la forme d’un objet JSON valide sans texte additionnel.' },
  { label: '🧠 Raisonnement Pas à Pas', prompt: 'Tu es un modèle de raisonnement logique. Réfléchis étape par étape avant d’apporter une conclusion claire.' },
];

export default function PlaygroundClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/account/login?next=%2Fplayground');
    }
  }, [authLoading, isAuthenticated, router]);

  // Dynamic Models State
  const [availableModels, setAvailableModels] = useState<(ModelInfo & { isFree?: boolean })[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Mode Selection: Single vs Multi-Model Comparison
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Multi-Model Compare Selection (jusqu'à 4 modèles)
  const [comparedModelTags, setComparedModelTags] = useState<string[]>([
    'mDevsLabs/mAI-1.2-Light',
    'google/gemini-2.5-flash:free',
  ]);

  // States pour la comparaison multi-modèles
  const [compareStates, setCompareStates] = useState<Record<string, ModelComparisonState>>({});

  // Clé API d'exécution State
  const [userApiKeys, setUserApiKeys] = useState<UserKeyItem[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // Configuration State
  const [config, setConfig] = useState<PlaygroundConfig>({
    model: 'mDevsLabs/mAI-1.2-Light',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'Tu es un assistant IA local rapide, utile, précis et concis.'});

  // Messages State (Single Mode)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Bonjour ! Je suis votre assistant IA local. Sélectionnez un modèle à gauche, ajustez les paramètres et envoyez vos prompts en streaming.',
      timestamp: Date.now()},
  ]);

  // Input & Generation State
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [, setErrorMsg] = useState<string | null>(null);
  const [, setCopiedMsgId] = useState<string | null>(null);

  // Status & Metrics State (Single Mode)
  const [tokenCount, setTokenCount] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [, setOllamaStatus] = useState<any>({});


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedModelInfo = availableModels.find((m) => m.ollamaTag === config.model) || availableModels[0];

  // Chargement des clés API de l'utilisateur
  useEffect(() => {
    const fetchKeys = async () => {
      if (!user) return;
      try {
        const userIdHeader = encodeURIComponent(String(user.id || user.username || user.email || 'dev_user'));
        const res = await fetch('/api/dev-keys', {
          headers: { 'x-user-id': userIdHeader }});
        const data = await res.json();
        if (data.success && Array.isArray(data.keys)) {
          const formatted = data.keys.map((k: any) => ({
            id: k.id || k.prefix,
            name: k.name || 'Clé API',
            prefix: k.prefix,
            key: k.key || k.prefix}));
          setUserApiKeys(formatted);
          if (formatted.length > 0 && !selectedApiKey) {
            setSelectedApiKey(formatted[0].key || formatted[0].prefix);
          }
        }
      } catch (err) {
        console.error('Erreur chargement clés API:', err);
      }
    };
    fetchKeys();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Chargement des modèles dynamiques via /api/v1/models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const maiModels = maiModelsList.map((m) => ({
          id: m.id,
          name: m.name,
          tagline: m.tagline,
          badge: 'Gratuit',
          parameters: m.parameters,
          vision: m.vision,
          context: `${Math.round(m.contextWindow / 1024)}K`,
          releaseDate: m.releaseDate,
          bannerImage: '',
          squareImage: '',
          ollamaTag: m.ollamaTag,
          readmeContent: m.description || '',
          isFree: true}));

        const isFree = !user || user.tier === 'Free' || user.tier === 'gratuit';
        let fetchedCloud: any[] = [];
        try {
          let res = await fetch('/api/v1/models', {
            headers: user?.username || user?.email ? { 'x-user-id': encodeURIComponent(user.username || user.email) } : {}}).catch(() => null);

          if (!res || !res.ok) {
            res = await fetch('https://mai.val.run/v1/models').catch(() => null);
          }

          if (res && res.ok) {
            const data = await res.json();
            if (data.data && Array.isArray(data.data)) {
              fetchedCloud = data.data
                .filter((m: any) => !maiModelsList.some((mai) => mai.ollamaTag === m.id || mai.id === m.id))
                .map((m: any) => ({
                  id: m.id,
                  name: m.id,
                  provider: m.owned_by || 'v1',
                  maxContext: m.maxContext || 128000}));
            }
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des modèles v1/models:', err);
        }

        let allowedCloudModels = fetchedCloud.length > 0 ? fetchedCloud : openRouterModels;
        if (fetchedCloud.length === 0 && isFree) {
          allowedCloudModels = allowedCloudModels.filter((m) => m.id.includes(':free'));
        }

        const cloudModels = allowedCloudModels.map((m) => ({
          id: m.id,
          name: m.name || m.id,
          tagline: `Modèle Cloud API (${m.provider || 'v1'})`,
          badge: 'Premium',
          parameters: 'Cloud',
          vision: m.id.includes('vision') || m.id.includes('vl') || m.id.includes('gemini') || m.id.includes('claude-3-5'),
          context: m.maxContext ? `${Math.round(m.maxContext / 1024)}K` : '128K',
          releaseDate: '',
          bannerImage: '',
          squareImage: '',
          ollamaTag: m.id,
          readmeContent: '',
          isFree: false}));

        const combined = [...maiModels, ...cloudModels];
        setAvailableModels(combined);
        if (combined.length > 0) {
          setConfig((prev) => ({ ...prev, model: combined[0].ollamaTag }));
        }
      } catch (err) {
        console.error('Erreur chargement des modèles:', err);
      } finally {
        setModelsLoading(false);
      }
    };
    if (!authLoading) {
      loadModels();
    }
  }, [authLoading, user?.tier, user?.username, user?.email]);

  // Vérification Ollama
  const checkOllama = async (modelTag?: string) => {
    if (!selectedModelInfo || !selectedModelInfo.isFree) {
      setOllamaStatus({ online: true, modelInstalled: true, checking: false });
      setErrorMsg(null);
      return;
    }

    const target = modelTag || config.model;
    setOllamaStatus((prev: any) => ({ ...prev, checking: true }));
    try {
      const res = await fetch(`/api/ollama/status?model=${encodeURIComponent(target)}`);
      const data = await res.json();

      setOllamaStatus({
        online: data.online,
        modelInstalled: data.modelInstalled ?? true,
        version: data.version,
        message: data.message,
        checking: false});

      if (!data.online || !data.modelInstalled) {
        setErrorMsg(data.message);
      } else {
        setErrorMsg(null);
      }
    } catch {
      setOllamaStatus({ online: false, modelInstalled: false, checking: false });
      setErrorMsg("Impossible d'effectuer le test de connexion avec le serveur local Ollama.");
    }
  };

  useEffect(() => {
    if (availableModels.length > 0) {
      checkOllama(config.model);
    }
  }, [config.model, availableModels]);

  const handleClear = () => {
    setMessages([]);
    setAttachedImages([]);
    setErrorMsg(null);
    setTokenCount(0);
    setTokensPerSecond(0);
    setCompareStates({});
    toast.success('Conversation effacée');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!selectedModelInfo?.vision) {
      toast.error(`Le modèle ${selectedModelInfo?.name || ''} ne prend pas en charge la vision.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAttachedImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Clé d'exécution finale (custom ou selected)
  const getExecutionApiKey = () => customApiKey.trim() || selectedApiKey;

  // Génération pour un modèle spécifique (utilisé aussi bien en mode single qu'en comparateur)
  const streamSingleModel = async (
    modelTag: string,
    promptMessages: Message[],
    onChunk: (chunk: string, tokens: number, tps: number, latencyMs: number) => void
  ) => {
    const modelObj = availableModels.find((m) => m.ollamaTag === modelTag);
    const isFree = modelObj?.isFree;
    const endpoint = isFree ? '/api/ollama/chat' : '/api/playground/chat';

    const execKey = getExecutionApiKey().replace(/[^\x20-\x7E]/g, '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': encodeURIComponent(String(user?.id || user?.username || user?.email || 'dev_user'))};
    if (execKey) {
      headers['Authorization'] = `Bearer ${execKey}`;
    }

    const startTime = performance.now();
    let firstTokenLatency = 0;
    let receivedTokens = 0;
    let accumulatedContent = '';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelTag,
        messages: promptMessages.map((m) => ({
          role: m.role,
          content: m.content,
          images: m.images})),
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        systemPrompt: config.systemPrompt,
        apiKey: execKey})});

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur réseau.' }));
      throw new Error(errorData.error || `Erreur serveur HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Aucun flux de réponse reçu.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (firstTokenLatency === 0) {
        firstTokenLatency = Math.round(performance.now() - startTime);
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let contentChunk = '';
        try {
          const parsed = JSON.parse(trimmed);
          contentChunk = parsed.message?.content || parsed.response || parsed.choices?.[0]?.delta?.content || '';
        } catch {
          contentChunk = trimmed;
        }

        if (contentChunk) {
          accumulatedContent += contentChunk;
          receivedTokens += Math.max(1, Math.round(contentChunk.length / 3.5));
          const elapsedSec = (performance.now() - startTime) / 1000;
          const tps = elapsedSec > 0.1 ? Number((receivedTokens / elapsedSec).toFixed(1)) : 0;

          onChunk(accumulatedContent, receivedTokens, tps, firstTokenLatency);
        }
      }
    }

    if (buffer.trim()) {
      let contentChunk = '';
      try {
        const parsed = JSON.parse(buffer.trim());
        contentChunk = parsed.message?.content || parsed.response || parsed.choices?.[0]?.delta?.content || '';
      } catch {
        contentChunk = buffer.trim();
      }
      if (contentChunk) {
        accumulatedContent += contentChunk;
        const elapsedSec = (performance.now() - startTime) / 1000;
        const tps = elapsedSec > 0.1 ? Number((receivedTokens / elapsedSec).toFixed(1)) : 0;
        onChunk(accumulatedContent, receivedTokens, tps, firstTokenLatency);
      }
    }

    return accumulatedContent;
  };

  const handleSendPrompt = async (promptToSend: string, imagesToSend: string[] = []) => {
    const trimmed = promptToSend.trim();
    if ((!trimmed && imagesToSend.length === 0) || isStreaming) return;

    setErrorMsg(null);
    setInput('');
    setAttachedImages([]);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
      timestamp: Date.now()};

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    if (mode === 'single') {
      const assistantMsgId = (Date.now() + 1).toString();
      const initialAssistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()};
      setMessages([...newMessages, initialAssistantMsg]);
      setTokenCount(0);
      setTokensPerSecond(0);

      try {
        await streamSingleModel(config.model, newMessages, (content, tokens, tps) => {
          setTokenCount(tokens);
          setTokensPerSecond(tps);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content } : msg))
          );
        });
      } catch (err: any) {
        console.error('Playground Stream Error:', err);
        setErrorMsg(err.message || 'Une erreur est survenue pendant la génération.');
        setMessages((prev) =>
          prev.filter((msg) => !(msg.id === assistantMsgId && msg.content === ''))
        );
      } finally {
        setIsStreaming(false);
      }
    } else {
      // MODE COMPARATEUR : Génération en parallèle pour chaque modèle sélectionné
      const initialStates: Record<string, ModelComparisonState> = {};
      comparedModelTags.forEach((tag) => {
        initialStates[tag] = {
          modelTag: tag,
          content: '',
          isStreaming: true,
          tokens: 0,
          tokensPerSec: 0,
          latencyMs: 0,
          rating: null,
          error: null};
      });
      setCompareStates(initialStates);

      const promises = comparedModelTags.map(async (tag) => {
        try {
          await streamSingleModel(tag, newMessages, (content, tokens, tps, latencyMs) => {
            setCompareStates((prev) => ({
              ...prev,
              [tag]: {
                ...prev[tag],
                content,
                tokens,
                tokensPerSec: tps,
                latencyMs,
                isStreaming: true}}));
          });
          setCompareStates((prev) => ({
            ...prev,
            [tag]: { ...prev[tag], isStreaming: false }}));
        } catch (err: any) {
          setCompareStates((prev) => ({
            ...prev,
            [tag]: {
              ...prev[tag],
              isStreaming: false,
              error: err.message || 'Erreur lors de la génération.'}}));
        }
      });

      await Promise.all(promises);
      setIsStreaming(false);
    }
  };

  const handleSend = () => {
    handleSendPrompt(input, attachedImages);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRetryLast = () => {
    if (isStreaming || messages.length === 0) return;
    const lastUserMsgIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const lastUserMsg = messages[actualIndex];

    const historyBefore = messages.slice(0, actualIndex);
    setMessages(historyBefore);
    handleSendPrompt(lastUserMsg.content, lastUserMsg.images || []);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditMessage = (msg: Message) => {
    setInput(msg.content);
    if (msg.images) setAttachedImages(msg.images);
    toast.success('Prompt chargé dans le champ de saisie.');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.success('Texte copié !');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Ajout / Suppression d'un modèle en comparaison
  const handleAddComparedModel = (tag: string) => {
    if (comparedModelTags.length >= 4) {
      toast.error('Vous pouvez comparer au maximum 4 modèles simultanément.');
      return;
    }
    if (!comparedModelTags.includes(tag)) {
      setComparedModelTags([...comparedModelTags, tag]);
    }
  };

  const handleRemoveComparedModel = (tag: string) => {
    if (comparedModelTags.length <= 1) {
      toast.error('Il faut conserver au moins 1 modèle dans le comparateur.');
      return;
    }
    setComparedModelTags(comparedModelTags.filter((t) => t !== tag));
  };

  // Exporter comparaison au format Markdown / JSON / CSV
  const handleExportComparison = (format: 'md' | 'json' | 'csv') => {
    const userPrompt = messages.filter((m) => m.role === 'user').pop()?.content || 'Prompt';
    let fileContent = '';
    let fileName = `comparaison-modeles-${Date.now()}.${format}`;

    if (format === 'json') {
      fileContent = JSON.stringify({ prompt: userPrompt, results: compareStates }, null, 2);
    } else if (format === 'csv') {
      fileContent = 'Modèle,Tokens,Vitesse (t/s),Latence (ms),Score,Réponse\n';
      Object.values(compareStates).forEach((st) => {
        const cleanContent = `"${st.content.replace(/"/g, '""')}"`;
        fileContent += `"${st.modelTag}",${st.tokens},${st.tokensPerSec},${st.latencyMs},"${st.rating || ''}",${cleanContent}\n`;
      });
    } else {
      fileContent = `# Comparaison de Modèles - mAI\n\n**Prompt:** ${userPrompt}\n\n`;
      Object.values(compareStates).forEach((st) => {
        fileContent += `## Modèle: ${st.modelTag}\n`;
        fileContent += `- **Tokens:** ${st.tokens}\n`;
        fileContent += `- **Vitesse:** ${st.tokensPerSec} t/s\n`;
        fileContent += `- **Latence:** ${st.latencyMs} ms\n\n`;
        fileContent += `${st.content}\n\n---\n\n`;
      });
    }

    const dataStr = `data:text/${format};charset=utf-8,` + encodeURIComponent(fileContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Comparaison exportée au format ${format.toUpperCase()} !`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userInitials = (user?.username || user?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      {/* ─── BARRE SUPÉRIEURE : SÉLECTEUR DE MODE & ACTIONS ───────────────── */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setMode('single')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'single'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Mode Unique
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'compare'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Comparateur Multi-Modèles
              <span className="px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-800 text-[9px] font-black">
                PRO
              </span>
            </button>
          </div>
        </div>

        {mode === 'compare' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportComparison('md')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              Export MD
            </button>
            <button
              onClick={() => handleExportComparison('csv')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ─── COLONNE GAUCHE : PANNEAU DE CONFIGURATION & CLÉS (1/3) ───────── */}
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              Paramètres du Playground
            </h2>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Effacer la conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer
            </button>
          </div>

          {/* 🔑 SÉLECTEUR DE CLÉ API D'EXÉCUTION (Conforme à l'image fournie) */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-600" />
                Clé API d&apos;exécution :
              </label>
              <Link
                href="/account/keys"
                className="text-xs font-extrabold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-0.5"
              >
                Mes Clés
              </Link>
            </div>

            {/* Menu Déroulant des Clés Enregistrées */}
            <div className="relative">
              <select
                value={selectedApiKey}
                onChange={(e) => {
                  setSelectedApiKey(e.target.value);
                  if (e.target.value) setCustomApiKey('');
                }}
                className="w-full bg-white border border-purple-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-mono font-medium shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Standard (Automatique / Session)</option>
                {userApiKeys.map((k) => (
                  <option key={k.id} value={k.key || k.prefix}>
                    🔑 {k.name} ({k.prefix})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Champ de Saisie Manuelle */}
            <input
              type="password"
              placeholder="Ou saisissez une clé (mp-...)"
              value={customApiKey}
              onChange={(e) => {
                setCustomApiKey(e.target.value);
                if (e.target.value) setSelectedApiKey('');
              }}
              className="w-full bg-white border border-purple-200/70 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
            />
          </div>

          {/* Sélecteur de Modèle (Mode Unique) */}
          {mode === 'single' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Modèle principal</span>
                {selectedModelInfo?.vision ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold border border-purple-200">
                    <Eye className="w-3 h-3 text-purple-600" /> Vision
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                    <EyeOff className="w-3 h-3" /> Sans Vision
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-2xl px-4 py-3 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  disabled={modelsLoading || isStreaming}
                >
                  {modelsLoading ? (
                    <option>Chargement des modèles...</option>
                  ) : (
                    <>
                      <optgroup label="Modèles mAI Locaux (Gratuits)">
                        {availableModels
                          .filter((m) => m.isFree)
                          .map((m) => (
                            <option key={m.ollamaTag} value={m.ollamaTag}>
                              {m.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Modèles Premium (Quota Utilisateur)">
                        {availableModels
                          .filter((m) => !m.isFree)
                          .map((m) => (
                            <option key={m.ollamaTag} value={m.ollamaTag}>
                              {m.name}
                            </option>
                          ))}
                      </optgroup>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Choix des Modèles à Comparer (Mode Comparateur) */}
          {mode === 'compare' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Modèles en comparaison ({comparedModelTags.length}/4)
              </label>
              <div className="space-y-1.5">
                {comparedModelTags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <select
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...comparedModelTags];
                        newTags[i] = e.target.value;
                        setComparedModelTags(newTags);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 font-semibold"
                    >
                      {availableModels.map((m) => (
                        <option key={m.ollamaTag} value={m.ollamaTag}>
                          {m.name} ({m.isFree ? 'Gratuit' : 'Premium'})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveComparedModel(tag)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Retirer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {comparedModelTags.length < 4 && (
                  <button
                    onClick={() => {
                      const nextTag = availableModels.find((m) => !comparedModelTags.includes(m.ollamaTag))?.ollamaTag || availableModels[0]?.ollamaTag;
                      if (nextTag) handleAddComparedModel(nextTag);
                    }}
                    className="w-full py-1.5 rounded-xl border border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un modèle à comparer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Slider Température */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Température</label>
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-xs">
                {config.temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              disabled={isStreaming}
              className="w-full accent-purple-600 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Slider Tokens Max */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Tokens Max</label>
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-xs">
                {config.maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="64"
              max="4096"
              step="64"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) })}
              disabled={isStreaming}
              className="w-full accent-purple-600 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Presets de Prompt Système */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Préréglages du Prompt Système
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) setConfig({ ...config, systemPrompt: e.target.value });
              }}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 font-medium"
            >
              <option value="">Choisir un préréglage...</option>
              {SYSTEM_PROMPT_PRESETS.map((p, idx) => (
                <option key={idx} value={p.prompt}>
                  {p.label}
                </option>
              ))}
            </select>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              disabled={isStreaming}
              rows={2}
              placeholder="Consignes données à l'assistant..."
              className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* ─── COLONNE DROITE : ZONE DE CHAT OU COMPARATEUR SPLIT (2/3) ───────── */}
        <div className="lg:col-span-2 space-y-3">
          {mode === 'single' ? (
            /* MODE SINGLE CHAT */
            <>
              {/* En-tête avec métriques */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      {selectedModelInfo?.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold leading-none">Vitesse</span>
                      <span className="font-black text-slate-900 text-xs">
                        {tokensPerSecond > 0 ? `${tokensPerSecond} t/s` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <Gauge className="w-3.5 h-3.5 text-purple-600" />
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold leading-none">Tokens</span>
                      <span className="font-black text-slate-900 text-xs">{tokenCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Single Mode */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] min-h-[400px] max-h-[540px] overflow-y-auto flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="space-y-1.5 max-w-[85%]">
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed relative ${
                              msg.role === 'user'
                                ? 'bg-purple-600 text-white shadow-xs font-medium rounded-tr-xs'
                                : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          ) : (
            /* MODE COMPARATEUR MULTI-MODÈLES (SPLIT VIEW) */
            <div className={`grid gap-3 grid-cols-1 ${comparedModelTags.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {comparedModelTags.map((tag, idx) => {
                const state = compareStates[tag] || {
                  modelTag: tag,
                  content: '',
                  isStreaming: false,
                  tokens: 0,
                  tokensPerSec: 0,
                  latencyMs: 0};
                const modelInfo = availableModels.find((m) => m.ollamaTag === tag);

                return (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-2xl border border-purple-200/70 rounded-3xl p-4 shadow-sm space-y-3 flex flex-col justify-between min-h-[380px]"
                  >
                    {/* Header de la colonne modèle */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs truncate max-w-[160px]">
                            {modelInfo?.name || tag}
                          </h4>
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200">
                            {modelInfo?.isFree ? 'Gratuit' : 'Premium'}
                          </span>
                        </div>
                      </div>

                      {/* Score Thumbs Up / Down */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setCompareStates((prev) => ({
                              ...prev,
                              [tag]: { ...prev[tag], rating: prev[tag]?.rating === 'up' ? null : 'up' }}))
                          }
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            state.rating === 'up'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-emerald-600'
                          }`}
                          title="Gagnant / Préféré"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setCompareStates((prev) => ({
                              ...prev,
                              [tag]: { ...prev[tag], rating: prev[tag]?.rating === 'down' ? null : 'down' }}))
                          }
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            state.rating === 'down'
                              ? 'bg-red-100 border-red-300 text-red-700 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-red-600'
                          }`}
                          title="Moins bon"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Zone de contenu de la réponse */}
                    <div className="flex-1 overflow-y-auto text-xs text-slate-800 leading-relaxed font-sans space-y-2 p-1">
                      {state.isStreaming && !state.content ? (
                        <div className="flex items-center gap-2 py-4 text-purple-600 font-semibold">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Génération en cours...
                        </div>
                      ) : state.error ? (
                        <p className="text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                          {state.error}
                        </p>
                      ) : state.content ? (
                        <p className="whitespace-pre-wrap">{state.content}</p>
                      ) : (
                        <p className="text-slate-400 italic">En attente d&apos;un prompt pour comparer...</p>
                      )}
                    </div>

                    {/* Barre de métriques du modèle */}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium bg-slate-50/60 p-2 rounded-2xl">
                      <span title="Temps au premier token / Latence">
                        ⏱️ Latence : <strong>{state.latencyMs ? `${state.latencyMs}ms` : '—'}</strong>
                      </span>
                      <span title="Vitesse de génération">
                        ⚡ <strong>{state.tokensPerSec} t/s</strong>
                      </span>
                      <span title="Nombre total de tokens">
                        🔢 <strong>{state.tokens} tokens</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── BARRE DE CHAT (Entrée commune pour le mode Single ou Comparateur) ─ */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                rows={1}
                placeholder={
                  mode === 'compare'
                    ? `Posez votre question à ${comparedModelTags.length} modèles simultanément... (Entrée pour lancer)`
                    : 'Posez une question à ce modèle... (Entrée pour envoyer)'
                }
                className="flex-1 px-3 py-1.5 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none disabled:opacity-50"
              />

              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center gap-1 text-xs font-bold"
                title="Envoyer à tous les modèles"
              >
                <Send className="w-3.5 h-3.5" />
                {mode === 'compare' && <span>Lancer Comparaison</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
