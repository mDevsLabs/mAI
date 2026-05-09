"use client";

import { useRouter } from "next/navigation";
import { getRandomSuggestions } from "@/lib/suggestions";
import { SparklesIcon } from "./icons";
import { useState, useEffect, useMemo } from "react";

export function Preview() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Bonjour, comment puis-je vous aider ?");
  // Suggestions aléatoires chargées côté client uniquement (évite Math.random SSR)
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const greetings = [
      "Bonsoir, que puis-je faire pour vous ?",
      "Bonjour, comment puis-je vous aider ?",
      "Hello ! Que faisons-nous aujourd'hui ?",
      "Bienvenue ! De quoi souhaitez-vous discuter ?",
    ];
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    setSuggestions(getRandomSuggestions(4));
  }, []);

  const handleAction = (query?: string) => {
    const url = query ? `/?query=${encodeURIComponent(query)}` : "/";
    router.push(url);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-tl-2xl bg-background">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/20 px-5">
        <div className="flex size-5 items-center justify-center rounded bg-muted/60 ring-1 ring-border/50">
          <SparklesIcon size={10} />
        </div>
        <span className="text-[13px] text-muted-foreground">mAI</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo en haut de la page d'accueil */}
          <img src="/logo.png" alt="mAI Logo" className="size-16 mb-4" />
          
          {/* Badge Alpha */}
          <span className="mb-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Alpha
          </span>

          <h2 className="text-xl font-semibold tracking-tight">
            {greeting}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Posez une question, écrivez du code ou explorez des idées.
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-xl border border-border/30 bg-card/20 px-3 py-2.5 text-left text-[11px] leading-relaxed text-muted-foreground/70 transition-all duration-200 hover:border-border/60 hover:bg-card/40 hover:text-muted-foreground"
              key={suggestion}
              onClick={() => handleAction(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-5">
        <button
          className="flex w-full items-center rounded-2xl border border-border/30 bg-card/30 px-4 py-3 text-left text-[13px] text-muted-foreground/40 transition-colors hover:border-border/50 hover:text-muted-foreground/60"
          onClick={() => handleAction()}
          type="button"
        >
          Demandez n'importe quoi...
        </button>
      </div>
    </div>
  );
}
