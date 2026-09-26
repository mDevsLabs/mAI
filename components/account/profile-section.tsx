"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";

export function ProfileSection({ upgradedTier }: { upgradedTier: string | null }) {
  const { user, usage, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [notifyLimits, setNotifyLimits] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setNewUsername(user.username || "");
    setNewEmail(user.email || "");
    setNewPhone(user.phone || "");
  }, [user]);

  useEffect(() => {
    if (!usage) return;
    if (usage.newsletter !== undefined) setNewsletter(usage.newsletter);
    if (usage.notify_limits !== undefined) setNotifyLimits(usage.notify_limits);
  }, [usage]);

  if (!user) return null;

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar mis à jour !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload de l'avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Veuillez saisir votre mot de passe actuel pour valider les modifications.");
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateProfile({
        currentPassword: currentPassword.trim(),
        ...(newUsername.trim() !== user.username ? { username: newUsername.trim() } : {}),
        ...(newEmail.trim() !== user.email ? { email: newEmail.trim() } : {}),
        ...(newPhone.trim() !== (user.phone || "") ? { phone: newPhone.trim() } : {}),
        ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
        newsletter,
        notify_limits: notifyLimits,
      });
      setNewPassword("");
      setCurrentPassword("");
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <section
      id="profil"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative group">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-md cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-purple-500 hover:ring-offset-2 ${
              user.avatarUrl ? "bg-white" : "bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 text-white"
            }`}
            aria-label="Modifier l’avatar"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover bg-white" />
            ) : (
              (user.username || user.email).slice(0, 2).toUpperCase()
            )}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                uploadingAvatar
                  ? "bg-black/60 opacity-100 backdrop-blur-sm"
                  : "bg-black/40 opacity-0 group-hover:opacity-100"
              }`}
            >
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-4 h-4 text-purple-600" /> {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-600" /> Nom d&apos;utilisateur
          </p>
          <p className="font-bold text-slate-900 text-base">{user.username}</p>
        </div>
        <div className="rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-purple-600" /> Téléphone
          </p>
          <p className="font-bold text-slate-900 text-base">{user.phone || "Non renseigné"}</p>
        </div>
        <Link
          href="/pricing"
          className={`rounded-2xl bg-white/60 border border-slate-200/80 p-4 shadow-sm transition-all duration-300 hover:border-purple-300 hover:shadow-md block ${
            upgradedTier === user.tier ? "ring-4 ring-purple-500/50 shadow-purple-500/30" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${upgradedTier === user.tier ? "text-purple-500 animate-pulse" : "text-purple-600"}`} />
              Abonnement
            </p>
            <span className="text-[10px] text-purple-600 font-bold hover:underline">Voir les offres →</span>
          </div>
          <motion.p
            className="font-bold text-slate-900 text-base"
            animate={upgradedTier === user.tier ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {user.tier || "Free"}
          </motion.p>
        </Link>
      </div>

      <div className="border-t border-slate-200/60" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" /> Modifier mon profil
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              id: "username",
              label: "Nom d'utilisateur",
              value: newUsername,
              setValue: setNewUsername,
              type: "text",
              placeholder: "Mon pseudo",
            },
            {
              id: "email",
              label: "Adresse e-mail",
              value: newEmail,
              setValue: setNewEmail,
              type: "email",
              placeholder: "mon.email@exemple.com",
            },
            {
              id: "phone",
              label: "Numéro de téléphone",
              value: newPhone,
              setValue: setNewPhone,
              type: "tel",
              placeholder: "+33612345678",
            },
            {
              id: "password",
              label: "Nouveau mot de passe (optionnel)",
              value: newPassword,
              setValue: setNewPassword,
              type: "password",
              placeholder: "6+ caractères",
            },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-xs font-bold text-slate-700 mb-1">
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(event) => field.setValue(event.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900"
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Préférences e-mail</h4>
          <div className="space-y-3">
            {[
              {
                id: "newsletter",
                title: "S'inscrire à la newsletter",
                description: "Recevoir les actualités mAI et les mises à jour importantes.",
                checked: newsletter,
                setChecked: setNewsletter,
              },
              {
                id: "notifyLimits",
                title: "M'avertir des limites de quota",
                description: "Recevoir un e-mail lorsque mes quotas API sont proches d'être atteints.",
                checked: notifyLimits,
                setChecked: setNotifyLimits,
              },
            ].map((preference) => (
              <label key={preference.id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preference.checked}
                  onChange={(event) => preference.setChecked(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="relative flex items-center justify-center mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors group-hover:border-purple-500">
                  <svg
                    className={`w-3 h-3 text-white fill-current opacity-0 peer-checked:opacity-100 transition-opacity`}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{preference.title}</span>
                  <span className="block text-xs text-slate-500">{preference.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60">
          <label htmlFor="currentPassword" className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-500" /> Mot de passe actuel
            <span className="text-red-500 font-normal">(Obligatoire pour enregistrer)</span>
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Saisissez votre mot de passe actuel"
            className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-white/80 border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 text-slate-900"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updatingProfile}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {updatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}
