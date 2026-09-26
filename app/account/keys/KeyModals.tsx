"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, Copy, Edit, Loader2, Lock, Plus, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import type { ApiKeyMetadata, CreatedApiKeyResult } from "@/lib/api-key-types";

type KeyModalsProps = {
  copied: boolean;
  createdSecret: CreatedApiKeyResult | null;
  creating: boolean;
  editIsActive: boolean;
  editLimit: string;
  editing: boolean;
  isCreateOpen: boolean;
  keyToEdit: ApiKeyMetadata | null;
  keyToRevoke: ApiKeyMetadata | null;
  newKeyLimit: string;
  newKeyName: string;
  onConfirmRevoke: () => void;
  onCopySecret: () => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onEditSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDismissCreated: () => void;
  onDismissEdit: () => void;
  onDismissRevoke: () => void;
  revoking: boolean;
  setEditIsActive: (value: boolean) => void;
  setEditLimit: (value: string) => void;
  setIsCreateOpen: (value: boolean) => void;
  setNewKeyLimit: (value: string) => void;
  setNewKeyName: (value: string) => void;
};

export function KeyModals(props: KeyModalsProps) {
  const {
    copied, createdSecret, creating, editIsActive, editLimit, editing, isCreateOpen,
    keyToEdit, keyToRevoke, newKeyLimit, newKeyName, onConfirmRevoke, onCopySecret,
    onCreate, onDismissCreated, onDismissEdit, onDismissRevoke, onEditSubmit,
    revoking, setEditIsActive, setEditLimit, setIsCreateOpen, setNewKeyLimit, setNewKeyName,
  } = props;
  return (
    <>
      <AnimatePresence>
        {createdSecret && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-orange-500/10 border-2 border-amber-400/50 shadow-xl space-y-4 relative">
            <button onClick={onDismissCreated} className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-black/5"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold"><Lock className="w-4 h-4" /></div><div><h4 className="font-extrabold text-slate-900 text-base">Clé API générée pour &quot;{createdSecret.name}&quot;</h4><p className="text-xs text-amber-700 font-bold"><AlertTriangle className="inline w-4 h-4 align-middle" /> Sauvegardez cette clé immédiatement. Cette valeur ne sera plus jamais affichée !</p></div></div>
            <div className="flex items-center gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-inner"><code className="flex-1 font-mono text-xs sm:text-sm text-emerald-400 break-all select-all tracking-wider">{createdSecret.secretKey}</code><motion.button whileTap={{ scale: 0.9 }} onClick={onCopySecret} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"><AnimatePresence mode="wait" initial={false}>{copied ? <motion.span key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Check className="w-4 h-4 stroke-[3]" />Copié !</motion.span> : <motion.span key="copy" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Copy className="w-4 h-4" />Copier le secret</motion.span>}</AnimatePresence></motion.button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-600" />Créer une nouvelle clé API</h3><button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button></div><form onSubmit={onCreate} className="space-y-4"><div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nom de l&apos;application / Clé</label><input type="text" value={newKeyName} onChange={(event) => setNewKeyName(event.target.value)} placeholder="Ex: Serveur Backend Prod, Bot Discord..." required autoFocus className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30" /></div><div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Limite max. requêtes (optionnel)</label><input type="number" value={newKeyLimit} onChange={(event) => setNewKeyLimit(event.target.value)} placeholder="Laissez vide pour aucune limite" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30" /></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button><button type="submit" disabled={creating || !newKeyName.trim()} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm flex items-center gap-2 disabled:opacity-50">{creating && <Loader2 className="w-4 h-4 animate-spin" />}Générer la clé</button></div></form></motion.div></div>}
      </AnimatePresence>

      <AnimatePresence>
        {keyToEdit && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><Edit className="w-5 h-5 text-purple-600" />Configurer la clé API</h3><button onClick={onDismissEdit} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button></div><form onSubmit={onEditSubmit} className="space-y-4"><div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Limite max. requêtes (optionnel)</label><input type="number" value={editLimit} onChange={(event) => setEditLimit(event.target.value)} placeholder="Laissez vide pour aucune limite" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30" /><p className="text-xs text-slate-500 mt-2">Actuellement: {keyToEdit.usageCount} requêtes effectuées.</p></div><div className="flex items-center gap-3 pt-2"><input type="checkbox" id="isActiveCheck" checked={editIsActive} onChange={(event) => setEditIsActive(event.target.checked)} className="w-5 h-5 text-purple-600 rounded border-slate-300" /><label htmlFor="isActiveCheck" className="text-sm font-bold text-slate-700 cursor-pointer">Clé API active</label></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onDismissEdit} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button><button type="submit" disabled={editing} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm flex items-center gap-2 disabled:opacity-50">{editing && <Loader2 className="w-4 h-4 animate-spin" />}Enregistrer</button></div></form></motion.div></div>}
      </AnimatePresence>

      <AnimatePresence>
        {keyToRevoke && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Trash2 className="w-5 h-5" /></div><div><h3 className="text-lg font-extrabold text-slate-900">Révoquer la clé API &quot;{keyToRevoke.name}&quot; ?</h3><p className="text-xs text-slate-500 mt-1 leading-relaxed">Cette action est définitive. Toutes les applications utilisant le préfixe <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{keyToRevoke.keyRef}</code> perdront immédiatement l&apos;accès à l&apos;API.</p></div></div><div className="flex justify-end gap-3 pt-2 border-t border-slate-100"><button onClick={onDismissRevoke} disabled={revoking} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button><button onClick={onConfirmRevoke} disabled={revoking} className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center gap-2 disabled:opacity-50">{revoking && <Loader2 className="w-4 h-4 animate-spin" />}Confirmer la révocation</button></div></motion.div></div>}
      </AnimatePresence>
    </>
  );
}
