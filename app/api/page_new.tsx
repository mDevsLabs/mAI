"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Key, Copy, Check, Play, AlertTriangle, Database, RefreshCw, User, Shield, Terminal,
  Code, Eye, EyeOff, Sparkles, Zap, Globe, AlertCircle, Trash2, Plus, LogOut, LogIn,
  CheckCircle2, Layers,
} from "lucide-react";

// Types
interface ApiKeyDB {
  id: string; key: string; name: string; created_at: string;
  status: "active" | "revoked"; max_usage: number; usage_count: number;
  note: string; shown_once: boolean;
  plan?: "gratuit" | "pro" | "entreprise";
  ip_restriction?: string; domain_restriction?: string; user_id: string;
}

interface ApiKey {
  id: string; key: string; name: string; createdAt: string;
  status: "active" | "revoked"; maxUsage: number; usageCount: number;
  note: string; shownOnce: boolean;
  plan?: "gratuit" | "pro" | "entreprise";
  ipRestriction?: string; domainRestriction?: string;
}

interface UserAccount { email: string; isLoggedIn: boolean; }
interface EndpointChoice {
  id: string; method: "GET" | "POST"; path: string; name: string;
  description: string; defaultBody?: string;
}

export function generateApiKeyString(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let alpha = "";
  for (let i = 0; i < 10; i++) alpha += chars.charAt(Math.floor(Math.random() * chars.length));
  return `mp-${alpha}-${Math.floor(10000 + Math.random() * 90000)}`;
}

const MAI_API_BASE = process.env.NEXT_PUBLIC_MAI_API_URL?.replace(/\/$/, "") || "https://mai.val.run";

const ENDPOINTS: EndpointChoice[] = [
  { id: "get-models", method: "GET", path: "/v1/models", name: "GET /v1/models", description: "Liste tous les modèles IA disponibles" },
  { id: "chat-completions", method: "POST", path: "/v1/chat/completions", name: "POST /v1/chat/completions",
    description: "Génère une réponse textuelle de chat",
    defaultBody: JSON.stringify({ model: "mai-1", messages: [{ role: "system", content: "Vous êtes un assistant IA utile." }, { role: "user", content: "Bonjour ! Présente-toi rapidement." }], temperature: 0.7, max_tokens: 150 }, null, 2) },
  { id: "get-model-detail", method: "GET", path: "/v1/models/mai-1", name: "GET /v1/models/mai-1", description: "Obtient les métadonnées détaillées du modèle mAI-1" },
  { id: "get-model-detail-light", method: "GET", path: "/v1/models/mai-1-light", name: "GET /v1/models/mai-1-light", description: "Obtient les métadonnées détaillées du modèle mAI-1-Light" },
  { id: "get-model-detail-12-light", method: "GET", path: "/v1/models/mai-1.2-light", name: "GET /v1/models/mai-1.2-light", description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Light" },
  { id: "get-model-detail-12-apex", method: "GET", path: "/v1/models/mai-1.2-apex", name: "GET /v1/models/mai-1.2-apex", description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Apex" },
  { id: "get-model-detail-12-opal", method: "GET", path: "/v1/models/mai-1.2-opal", name: "GET /v1/models/mai-1.2-opal", description: "Obtient les métadonnées détaillées du modèle mAI-1.2-Opal" },
  { id: "create-embeddings", method: "POST", path: "/v1/embeddings", name: "POST /v1/embeddings",
    description: "Génère des embeddings vectoriels pour un texte donné",
    defaultBody: JSON.stringify({ model: "text-embedding-mai", input: "mDevsLabs est une équipe passionnée d'intelligence artificielle." }, null, 2) },
  { id: "content-moderation", method: "POST", path: "/v1/moderations", name: "POST /v1/moderations",
    description: "Vérifie si un contenu respecte les règles de sécurité",
    defaultBody: JSON.stringify({ input: "Ceci est un exemple de texte à modérer." }, null, 2) },
];
