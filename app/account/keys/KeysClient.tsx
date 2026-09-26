'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound, Plus, Trash2, ShieldAlert,
  Loader2, Activity, CheckSquare, Edit, Download
} from 'lucide-react';
import type { ApiKeyMetadata, CreatedApiKeyResult } from '@/lib/api-key-types';
import { KeyModals } from './KeyModals';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth-provider';

export default function KeysClient() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/account/login?next=%2Faccount%2Fkeys');
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

  const fetchKeys = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/dev-keys', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
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
  }, [token]);

  useEffect(() => {
    void fetchKeys();
  }, [token, fetchKeys]);

  // Deep-link onboarding : auto-ouvrir la création après tuto (sans useSearchParams pour éviter Suspense)
  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "create") {
      setIsCreateOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("onboarding");
      window.history.replaceState({}, "", url.toString());
    }
  }, [isAuthenticated]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch('/api/dev-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
      const res = await fetch(`/api/dev-keys/${encodeURIComponent(keyToEdit.keyRef)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    const targetId = idToRevoke || (keyToRevoke ? keyToRevoke.keyRef : null);
    if (!targetId || revoking) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/dev-keys/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
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
      content += `Préfixe public : ${k.keyRef}\n`;
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
      content += `# Key: ${k.name} (keyRef: ${k.keyRef})\n`;
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
            Vos clés API mAI confèrent un accès direct aux modèles d&apos;IA. Ne partagez jamais une clé secrète dans un dépôt public ou du code frontend. Le service conserve la valeur d&apos;authentification côté serveur pour valider les appels et le keyRef public dans les listes ; le secret complet n&apos;est renvoyé qu&apos;une seule fois à la création.
          </p>
        </div>
      </div>

      <KeyModals
        copied={copied}
        createdSecret={createdSecret}
        creating={creating}
        editIsActive={editIsActive}
        editLimit={editLimit}
        editing={editing}
        isCreateOpen={isCreateOpen}
        keyToEdit={isEditOpen ? keyToEdit : null}
        keyToRevoke={keyToRevoke}
        newKeyLimit={newKeyLimit}
        newKeyName={newKeyName}
        onConfirmRevoke={() => void handleConfirmRevoke()}
        onCopySecret={() => void handleCopySecret()}
        onCreate={(event) => void handleCreate(event)}
        onDismissCreated={() => setCreatedSecret(null)}
        onDismissEdit={() => { setIsEditOpen(false); setKeyToEdit(null); }}
        onDismissRevoke={() => setKeyToRevoke(null)}
        onEditSubmit={(event) => void handleEditSubmit(event)}
        revoking={revoking}
        setEditIsActive={setEditIsActive}
        setEditLimit={setEditLimit}
        setIsCreateOpen={setIsCreateOpen}
        setNewKeyLimit={setNewKeyLimit}
        setNewKeyName={setNewKeyName}
      />

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
                  <tr key={k.keyRef} className="hover:bg-purple-50/30 transition-colors">
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
                        {k.keyRef}
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




    </div>
  );
}
