'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Trash2,
  SlidersHorizontal,
  Bot,
  AlertTriangle,
  Gauge,
  Zap,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  RefreshCw,
  CheckCircle2,
  FileText,
  FileCode,
  Share2,
} from 'lucide-react';
import { ModelInfo } from '@/lib/models';
import { Message, PlaygroundConfig } from '@/lib/playground-types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { maiModelsList } from '@/maiModels';
import { openRouterModels } from '@/lib/ai-models';

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

  // Configuration State
  const [config, setConfig] = useState<PlaygroundConfig>({
    model: 'mDevsLabs/mAI-1.2-Light',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'Tu es un assistant IA local rapide, utile, précis et concis.',
  });

  // Messages State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Bonjour ! Je suis votre assistant IA local. Sélectionnez un modèle à gauche, ajustez les paramètres et envoyez vos prompts en streaming.',
      timestamp: Date.now(),
    },
  ]);

  // Input & Generation State
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Status & Metrics State
  const [tokenCount, setTokenCount] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState<{
    online: boolean;
    modelInstalled: boolean;
    version?: string;
    message?: string;
    checking: boolean;
  }>({ online: true, modelInstalled: true, checking: false });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedModelInfo = availableModels.find((m) => m.ollamaTag === config.model) || availableModels[0];

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
          isFree: true
        }));

        const isFree = !user || user.tier === 'Free' || user.tier === 'gratuit';
        let fetchedCloud: any[] = [];
        try {
          let res = await fetch('/api/v1/models', {
            headers: user?.username || user?.email ? { 'x-user-id': encodeURIComponent(user.username || user.email) } : {},
          }).catch(() => null);

          if (!res || !res.ok) {
            res = await fetch('https://mprojects.val.run/v1/models').catch(() => null);
          }

          if (res && res.ok) {
            const data = await res.json();
            if (data.data && Array.isArray(data.data)) {
              fetchedCloud = data.data
                .filter((m: any) => !maiModelsList.some(mai => mai.ollamaTag === m.id || mai.id === m.id))
                .map((m: any) => ({
                  id: m.id,
                  name: m.id,
                  provider: m.owned_by || 'v1',
                  maxContext: m.maxContext || 128000,
                }));
            }
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des modèles v1/models:', err);
        }

        let allowedCloudModels = fetchedCloud.length > 0 ? fetchedCloud : openRouterModels;
        if (fetchedCloud.length === 0 && isFree) {
          allowedCloudModels = allowedCloudModels.filter(m => m.id.includes(':free'));
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
          isFree: false
        }));

        const combined = [...maiModels, ...cloudModels];
        setAvailableModels(combined);
        if (combined.length > 0) {
          setConfig(prev => ({ ...prev, model: combined[0].ollamaTag }));
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

  // Vérification précise du modèle sélectionné et du serveur Ollama
  const checkOllama = async (modelTag?: string) => {
    if (!selectedModelInfo || !selectedModelInfo.isFree) {
       // Les modèles premium OpenRouter ne sont pas en local, on skip la vérification
       setOllamaStatus({ online: true, modelInstalled: true, checking: false });
       setErrorMsg(null);
       return;
    }

    const target = modelTag || config.model;
    setOllamaStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch(`/api/ollama/status?model=${encodeURIComponent(target)}`);
      const data = await res.json();

      setOllamaStatus({
        online: data.online,
        modelInstalled: data.modelInstalled ?? true,
        version: data.version,
        message: data.message,
        checking: false,
      });

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
    toast.success('Conversation effacée');
  };

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

  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
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
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Initialiser le message de l'assistant (avec du contenu vide)
    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages([...newMessages, initialAssistantMsg]);
    setIsStreaming(true);
    setTokenCount(0);
    setTokensPerSecond(0);

    const startTime = performance.now();
    let receivedTokens = 0;
    let accumulatedContent = '';

    try {
      const isFree = selectedModelInfo?.isFree;
      // Pour les modèles premium, on passe par un endpoint NextJS ou on modifie /api/ollama/chat pour router ?
      // Utilisons /api/playground/chat pour gérer les premium vs gratuits de façon sécurisée (avec x-user-id)
      const endpoint = isFree ? '/api/ollama/chat' : '/api/playground/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': encodeURIComponent(user?.username || user?.email || 'dev_user'),
        },
        body: JSON.stringify({
          model: config.model,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            images: m.images,
          })),
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          systemPrompt: config.systemPrompt,
        }),
      });

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
            // Si ce n'est pas du JSON, traiter comme du texte brut
            contentChunk = trimmed;
          }

          if (contentChunk) {
            accumulatedContent += contentChunk;
            receivedTokens += Math.max(1, Math.round(contentChunk.length / 3.5));
            setTokenCount(receivedTokens);
          }
        }

        const currentTime = performance.now();
        const elapsedSec = (currentTime - startTime) / 1000;
        if (elapsedSec > 0.1) {
          const tps = Number((receivedTokens / elapsedSec).toFixed(1));
          setTokensPerSecond(tps);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
          )
        );
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error('Playground Stream Error:', err);
      setErrorMsg(err.message || 'Une erreur est survenue pendant la génération.');
      setMessages((prev) =>
        prev.filter((msg) => !(msg.id === assistantMsgId && msg.content === ''))
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = () => {
    handleSendPrompt(input, attachedImages);
  };

  // Réessayer la dernière génération
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

  // Modifier un prompt utilisateur
  const handleEditMessage = (msg: Message) => {
    setInput(msg.content);
    if (msg.images) {
      setAttachedImages(msg.images);
    }
    toast.success('Prompt chargé dans le champ de saisie.');
  };

  // Renvoyer un message utilisateur
  const handleResendMessage = (msg: Message) => {
    handleSendPrompt(msg.content, msg.images || []);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.success('Texte copié !');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Copier les statistiques de tokens
  const handleCopyTokenStats = () => {
    const statsStr = `[Statistiques mAI] Modèle: ${selectedModelInfo?.name} | Tokens générés: ${tokenCount} | Vitesse: ${tokensPerSecond > 0 ? `${tokensPerSecond} t/s` : 'N/A'}`;
    navigator.clipboard.writeText(statsStr);
    toast.success('Statistiques des tokens copiées !');
  };

  // Exporter la conversation en JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `conversation-mai-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exportation JSON téléchargée !');
  };

  // Exporter la conversation en Markdown
  const handleExportMarkdown = () => {
    let md = `# Conversation mAI - ${selectedModelInfo?.name}\n\n`;
    messages.forEach((m) => {
      const roleName = m.role === 'user' ? 'Utilisateur' : 'Assistant mAI';
      md += `### ${roleName}\n${m.content}\n\n`;
    });
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `conversation-mai-${Date.now()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exportation Markdown téléchargée !');
  };

  const userInitials = (user?.username || user?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {/* ─── COLONNE GAUCHE : PANNEAU DE CONFIGURATION (1/3) ───────────────── */}
      <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-5 sticky top-24">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            Paramètres du modèle
          </h2>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            title="Effacer la conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Effacer
          </button>
        </div>

        {/* 1. Sélecteur de Modèle (SANS poids entre parenthèses) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Modèle</span>
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
                          {availableModels.filter(m => m.isFree).map((m) => (
                            <option key={m.ollamaTag} value={m.ollamaTag}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Modèles Premium (Quota Utilisateur)">
                          {availableModels.filter(m => !m.isFree).map((m) => (
                            <option key={m.ollamaTag} value={m.ollamaTag}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
          </div>

          {/* Spécifications du modèle */}
          {selectedModelInfo && (
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-slate-600 space-y-1.5 mt-2">
              <p className="font-medium text-slate-800 leading-relaxed text-[11px]">{selectedModelInfo.tagline}</p>
              <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-700">
                  Tag: {selectedModelInfo.ollamaTag}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-700">
                  Contexte: {selectedModelInfo.context}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Slider Température */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <label className="font-bold text-slate-700 uppercase tracking-wider">
              Température
            </label>
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

        {/* 3. Slider Tokens Max */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <label className="font-bold text-slate-700 uppercase tracking-wider">
              Tokens Max
            </label>
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

        {/* 4. Prompt Système */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Prompt Système
          </label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            disabled={isStreaming}
            rows={2}
            placeholder="Consignes données à l'assistant..."
            className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* 5. Exporter la conversation & Vérification status */}
        <div className="border-t border-slate-200/80 pt-3.5 space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Actions &amp; Exportation
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => checkOllama(config.model)}
              disabled={ollamaStatus.checking}
              className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${ollamaStatus.checking ? 'animate-spin' : ''}`} />
              Vérifier modèle &amp; connexion
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={handleExportJSON}
                disabled={messages.length === 0}
                className="flex-1 py-1.5 px-2.5 rounded-2xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-600" />
                Export JSON
              </button>
              <button
                onClick={handleExportMarkdown}
                disabled={messages.length === 0}
                className="flex-1 py-1.5 px-2.5 rounded-2xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                Export MD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── COLONNE DROITE : ZONE DE CHAT COMPACTE & MÉTRIQUES (2/3) ───────── */}
      <div className="lg:col-span-2 space-y-3">
        {/* En-tête avec métriques et status précis du modèle */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                {selectedModelInfo?.name}
                {!selectedModelInfo?.vision && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    Texte uniquement
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {ollamaStatus.online && ollamaStatus.modelInstalled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Modèle disponible &amp; prêt
                  </span>
                ) : ollamaStatus.online && !ollamaStatus.modelInstalled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Modèle non installé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    <AlertTriangle className="w-3 h-3 text-red-600" /> Ollama Hors-Ligne
                  </span>
                )}
              </div>
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

            <button
              onClick={handleCopyTokenStats}
              className="p-1.5 rounded-2xl bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200/80 transition-colors shadow-2xs"
              title="Copier les statistiques des tokens"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRetryLast}
              disabled={isStreaming || messages.length === 0}
              className="p-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-2xs disabled:opacity-40"
              title="Réessayer / Régénérer la dernière réponse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner d'Erreur Précis */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-3xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Diagnostic du Modèle et d&apos;Ollama</p>
                <p className="text-[11px] leading-relaxed text-red-600">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => checkOllama(config.model)}
              className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 shrink-0 cursor-pointer"
            >
              Tester à nouveau
            </button>
          </motion.div>
        )}

        {/* Zone des Messages (Bulles compactes & Avatar Utilisateur réel) */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] min-h-[400px] max-h-[540px] overflow-y-auto flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isAssistantEmpty = msg.role === 'assistant' && !msg.content;

                return (
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
                      {/* Images rattachées (utilisateur) */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {msg.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Image envoyée"
                              className="w-24 h-24 object-cover rounded-xl border border-purple-300 shadow-2xs"
                            />
                          ))}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed relative group ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white shadow-xs font-medium rounded-tr-xs'
                            : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-xs'
                        }`}
                      >
                        {/* Si le message assistant est vide pendant le streaming, afficher les 3 points ANIMÉS DEDANS */}
                        {isAssistantEmpty && isStreaming ? (
                          <div className="flex items-center gap-1.5 py-1 text-slate-500 font-semibold text-xs">
                            <span>Génération en cours</span>
                            <motion.span
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                              className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"
                            />
                            <motion.span
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                              className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"
                            />
                            <motion.span
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                              className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}

                        {/* Barre d'actions du message (si non vide) */}
                        {msg.content && (
                          <div
                            className={`mt-1.5 pt-1.5 flex items-center justify-end gap-1 text-[11px] ${
                              msg.role === 'user'
                                ? 'border-t border-purple-500/40 text-purple-100'
                                : 'border-t border-slate-100 text-slate-400'
                            }`}
                          >
                            <button
                              onClick={() => handleCopyMessage(msg.id!, msg.content)}
                              className={`p-1 px-1.5 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                                msg.role === 'user'
                                  ? 'hover:bg-purple-500/50'
                                  : 'hover:bg-slate-100 hover:text-slate-700'
                              }`}
                              title="Copier le texte"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" /> Copié
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copier
                                </>
                              )}
                            </button>

                            {msg.role === 'user' && (
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1 px-1.5 rounded-lg hover:bg-purple-500/50 transition-colors flex items-center gap-1 font-semibold"
                                title="Charger dans la barre pour modifier"
                              >
                                <Edit3 className="w-3 h-3" /> Modifier
                              </button>
                            )}

                            {msg.role === 'user' && (
                              <button
                                onClick={() => handleResendMessage(msg)}
                                disabled={isStreaming}
                                className="p-1 px-1.5 rounded-lg hover:bg-purple-500/50 transition-colors flex items-center gap-1 font-semibold disabled:opacity-50"
                                title="Renvoyer ce prompt"
                              >
                                <RefreshCw className="w-3 h-3" /> Renvoyer
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avatar de l'utilisateur (depuis le compte connecté) */}
                    {msg.role === 'user' && (
                      user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-7 h-7 rounded-xl object-cover bg-white ring-1 ring-black/10 shrink-0 mt-0.5 shadow-2xs"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {userInitials}
                        </div>
                      )
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── BARRE DE CHAT COMPACTE & IMPORT IMAGES ───────────────────────── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-2">
          {/* Previews des images attachées */}
          {attachedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group w-12 h-12 rounded-xl overflow-hidden border border-purple-300">
                  <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Input d'image (Masqué / Visible selon la capacité Vision) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/png, image/jpeg, image/webp"
              multiple
              className="hidden"
            />

            {selectedModelInfo?.vision ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
                title="Joindre une image (Modèle Vision)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Image</span>
              </button>
            ) : (
              <div
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 opacity-60 shrink-0 flex items-center gap-1 text-xs font-bold cursor-not-allowed"
                title="Modèle sans support Vision"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pas de Vision</span>
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={1}
              placeholder={
                selectedModelInfo?.vision
                  ? 'Posez une question ou joignez une image... (Entrée pour envoyer)'
                  : 'Posez une question à ce modèle... (Entrée pour envoyer)'
              }
              className="flex-1 px-3 py-1.5 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none disabled:opacity-50"
            />

            <button
              onClick={handleSend}
              disabled={isStreaming || (!input.trim() && attachedImages.length === 0)}
              className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
              title="Envoyer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
