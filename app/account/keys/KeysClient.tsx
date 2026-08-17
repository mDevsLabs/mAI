'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, Plus, Copy, Check, Trash2, AlertTriangle, ShieldAlert,
  Loader2, Activity, X, Lock, CheckSquare, Edit, Download
} from 'lucide-react';
import { ApiKeyMetadata, CreatedApiKeyResult } from '@/lib/api-key-manager';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth-provider';

export default function KeysClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/account/login?next=%2Fapi%2Fkeys');
    }
  }, [authLoading, isAuthenticated, router]);

  const [keys, setKeys] = useState<ApiKeyMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Creation Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [keyToEdit, setKeyToEdit] = useState<ApiKeyMetadata | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editing, setEditing] = useState(false);

  // Single Exposure Secret Alert State
  const [createdSecret, setCreatedSecret] = useState<CreatedApiKeyResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Revocation Confirm Dialog State
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyMetadata | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev-keys', {
        headers: {
          'x-user-id': encodeURIComponent(String(user?.id || user?.username || user?.email || 'dev_user')),
        },
      });
      const data = await res.json();
      if (data.success && data.keys) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error('Erreur chargement clés:', err);
      toast.error('Impossible de charger vos clés API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch('/api/dev-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': encodeURIComponent(String(user?.id || user?.username || user?.email || 'dev_user')),
        },
        body: JSON.stringify({ name: newKeyName.trim(), maxLimit: newKeyLimit }),
      });

      const data = await res.json();
      if (data.success && data.key) {
        setCreatedSecret(data.key);
        setIsCreateOpen(false);
        setNewKeyName('');
        setNewKeyLimit('');
        fetchKeys();
        toast.success('Nouvelle clé API générée !');
      } else {
        toast.error(data.error?.message || 'Erreur de création.');
      }
    } catch (err) {
      console.error('Erreur création clé:', err);
      toast.error('Erreur serveur lors de la création.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyToEdit || editing) return;
    setEditing(true);

    try {
      const res = await fetch(`/api/dev-keys/${encodeURIComponent(keyToEdit.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': encodeURIComponent(String(user?.id || user?.username || user?.email || 'dev_user')),
        },
        body: JSON.stringify({ 
          maxLimit: editLimit,
          isActive: editIsActive 
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Clé API modifiée !');
        setIsEditOpen(false);
        setKeyToEdit(null);
        fetchKeys();
      } else {
        toast.error(data.error?.message || 'Erreur lors de la modification.');
      }
    } catch (err) {
      console.error('Erreur modification clé:', err);
      toast.error('Erreur serveur lors de la modification.');
    } finally {
      setEditing(false);
    }
  };

  const handleCopySecret = async () => {
    if (!createdSecret) return;
    try {
      await navigator.clipboard.writeText(createdSecret.secretKey);
      setCopied(true);
      toast.success('Clé secrète copiée !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Échec de la copie.');
    }
  };

  const handleConfirmRevoke = async (idToRevoke?: string) => {
    const targetId = idToRevoke || (keyToRevoke ? keyToRevoke.id : null);
    if (!targetId || revoking) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/dev-keys/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': encodeURIComponent(String(user?.id || user?.username || user?.email || 'dev_user')),
        },
      });

      const data = await res.json();
      if (data.success) {
        if (!idToRevoke) toast.success('Clé API révoquée avec succès.');
        setKeyToRevoke(null);
        fetchKeys();
      } else {
        toast.error(data.error?.message || 'Erreur lors de la révocation.');
      }
    } catch (err) {
      console.error('Erreur révocation:', err);
      toast.error('Impossible de révoquer la clé.');
    } finally {
      setRevoking(false);
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedKeys.length === 0) return;
    const confirm = window.confirm(`Voulez-vous vraiment supprimer ${selectedKeys.length} clé(s) sélectionnée(s) ?`);
    if (!confirm) return;

    for (const id of selectedKeys) {
      await handleConfirmRevoke(id);
    }
    toast.success('Clés supprimées avec succès.');
    setSelectedKeys([]);
    fetchKeys();
  };

  const handleExportTxt = () => {
    const toExport = keys.filter(k => selectedKeys.includes(k.id));
    if (toExport.length === 0) return;
    let content = "Clés API mAI\n==================\n\n";
    toExport.forEach(k => {
      content += `Nom : ${k.name}\n`;
      content += `Prefixe (Public) : ${k.prefix}\n`;
      content += `Limite de requêtes : ${k.maxLimit || 'Illimité'}\n`;
      content += `Créée le : ${formatDate(k.createdAt)}\n`;
      content += `Status : ${k.isActive ? 'Active' : 'Désactivée'}\n`;
      content += `------------------\n`;
    });
    content += "\nNote: Pour des raisons de sécurité, les secrets complets ne sont pas exportables.";
    downloadFile(content, 'mai_api_keys.txt');
  };

  const handleExportEnv = () => {
    const toExport = keys.filter(k => selectedKeys.includes(k.id));
    if (toExport.length === 0) return;
    let content = "# mAI API Keys\n";
    toExport.forEach((k, idx) => {
      content += `# Key: ${k.name} (Prefix: ${k.prefix})\n`;
      content += `MAI_API_KEY_${idx + 1}="mai_live_..."\n\n`;
    });
    downloadFile(content, 'mai_api_keys.env');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelection = (id: string) => {
    setSelectedKeys(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const toggleAllSelection = () => {
    if (selectedKeys.length === keys.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(keys.map(k => k.id));
    }
  };

  const openEditModal = (k: ApiKeyMetadata) => {
    setKeyToEdit(k);
    setEditLimit(k.maxLimit !== null && k.maxLimit !== undefined ? k.maxLimit.toString() : '');
    setEditIsActive(k.isActive !== undefined ? k.isActive : true);
    setIsEditOpen(true);
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return 'Jamais';
    try {
      return new Date(isoStr).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── AVERTISSEMENT DE SÉCURITÉ EN HAUT ───────────────────────────── */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h3 className="font-extrabold text-amber-950 flex items-center gap-2">
            Consignes de Sécurité Développeur
          </h3>
          <p className="text-slate-700 leading-relaxed text-xs">
            Vos clés API mAI confèrent un accès direct aux modèles d&apos;IA. Ne partagez jamais vos clés secrètes dans des dépôts publics GitHub ou dans du code frontend exécuté côté client. Seul le hash SHA-256 de vos clés est conservé dans nos bases.
          </p>
        </div>
      </div>

      {/* ─── ALERTE SECRET CRÉÉ (AFFICHAGE UNIQUE) ───────────────────────── */}
      <AnimatePresence>
        {createdSecret && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-orange-500/10 border-2 border-amber-400/50 shadow-xl space-y-4 relative"
          >
            <button
              onClick={() => setCreatedSecret(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-black/5 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Clé API générée pour &quot;{createdSecret.name}&quot;
                </h4>
                <p className="text-xs text-amber-700 font-bold">
                  ⚠️ Sauvegardez cette clé immédiatement. Cette valeur ne sera plus jamais affichée !
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
              <code className="flex-1 font-mono text-xs sm:text-sm text-emerald-400 break-all select-all tracking-wider">
                {createdSecret.secretKey}
              </code>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopySecret}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> Copié !
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" /> Copier le secret
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ENTÊTE SECTION & BOUTON NOUVELLE CLÉ ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" />
            Vos Clés API Actives
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos accès API. Authentifiez vos requêtes HTTP avec l&apos;en-tête{' '}
            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">
              Authorization: Bearer mai_live_...
            </code>
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Créer une clé API
        </button>
      </div>

      {/* ─── ACTIONS DE MASSE ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-3xl p-4 shadow-sm overflow-hidden"
          >
            <span className="text-purple-700 font-bold text-sm ml-2">
              {selectedKeys.length} clé(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleExportEnv}
                className="px-4 py-2 bg-white border border-purple-200 rounded-xl text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" /> Exporter (.env)
              </button>
              <button
                onClick={handleExportTxt}
                className="px-4 py-2 bg-white border border-purple-200 rounded-xl text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" /> Exporter (.txt)
              </button>
              <button
                onClick={handleBulkRevoke}
                className="px-4 py-2 bg-red-100 border border-red-200 rounded-xl text-red-700 font-bold text-xs hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TABLEAU DES CLÉS API ────────────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span>Chargement des clés API...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <KeyRound className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">Aucune clé API active trouvée.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-xs text-purple-600 font-bold hover:underline"
            >
              Générez votre première clé développeur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-4 px-6 text-center w-12">
                    <button onClick={toggleAllSelection} className="text-slate-400 hover:text-purple-600">
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="py-4 px-2">Nom</th>
                  <th className="py-4 px-2">Préfixe</th>
                  <th className="py-4 px-2">Dernière utilisation</th>
                  <th className="py-4 px-2 text-center">Requêtes</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedKeys.includes(k.id)}
                        onChange={() => toggleSelection(k.id)}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-4 px-2 font-bold text-slate-900">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${k.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {k.name}
                        </span>
                        {k.isActive === false && <span className="text-[10px] text-red-500 uppercase">Désactivée</span>}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <code className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 font-mono text-xs font-semibold border border-slate-200">
                        {k.prefix}
                      </code>
                    </td>
                    <td className="py-4 px-2 text-xs text-slate-500">
                      {formatDate(k.lastUsedAt)}
                    </td>
                    <td className="py-4 px-2 text-center font-extrabold text-slate-900 text-xs">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          <Activity className="w-3 h-3 text-purple-600" />
                          {k.usageCount.toLocaleString()}
                        </span>
                        {k.maxLimit !== null && k.maxLimit !== undefined && (
                          <span className="text-[10px] text-slate-400">/ {k.maxLimit} max</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(k)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="Configurer la clé"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editer
                      </button>
                      <button
                        onClick={() => setKeyToRevoke(k)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="Révoquer la clé"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Révoquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* ─── MODAL DIALOG : CRÉATION DE CLÉ ──────────────────────────────── */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Créer une nouvelle clé API
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nom de l&apos;application / Clé
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ex: Serveur Backend Prod, Bot Discord..."
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Limite max. requêtes (optionnel)
                  </label>
                  <input
                    type="number"
                    value={newKeyLimit}
                    onChange={(e) => setNewKeyLimit(e.target.value)}
                    placeholder="Laissez vide pour aucune limite"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Générer la clé
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL DIALOG : ÉDITION DE CLÉ ──────────────────────────────── */}
      <AnimatePresence>
        {isEditOpen && keyToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-purple-600" />
                  Configurer la clé API
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Limite max. requêtes (optionnel)
                  </label>
                  <input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    placeholder="Laissez vide pour aucune limite"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <p className="text-xs text-slate-500 mt-2">Actuellement: {keyToEdit.usageCount} requêtes effectuées.</p>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Clé API active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={editing}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL DIALOG : CONFIRMATION RÉVOCATION ──────────────────────── */}
      <AnimatePresence>
        {keyToRevoke && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Révoquer la clé API &quot;{keyToRevoke.name}&quot; ?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cette action est définitive. Toutes les applications utilisant le préfixe{' '}
                    <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">
                      {keyToRevoke.prefix}
                    </code>{' '}
                    perdront immédiatement l&apos;accès à l&apos;API.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setKeyToRevoke(null)}
                  disabled={revoking}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleConfirmRevoke()}
                  disabled={revoking}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmer la révocation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
