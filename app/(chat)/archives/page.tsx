/**
 * Page des Archives de mAI
 * Regroupe les conversations archivées.
 * 
 * @version 0.0.6
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, ArchiveRestoreIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ArchivedChat = {
  id: string;
  title: string;
  date: string;
};

const mockArchivedChats: ArchivedChat[] = [
  { id: "1", title: "Plan de marketing Q1", date: "2026-04-15" },
  { id: "2", title: "Recherche sur le Deep Learning", date: "2026-04-20" },
  { id: "3", title: "Idées de noms pour le projet", date: "2026-05-01" },
];

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchivedChat[]>(mockArchivedChats);
  const [search, setSearch] = useState("");

  const handleRestore = (id: string) => {
    setArchives(archives.filter(chat => chat.id !== id));
    toast.success("Conversation restaurée ! 🎉");
  };

  const handleDelete = (id: string) => {
    setArchives(archives.filter(chat => chat.id !== id));
    toast.success("Conversation supprimée définitivement ! 🗑️");
  };

  const filteredArchives = archives.filter(chat => 
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full overflow-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Archives</h1>
        <p className="text-muted-foreground">Retrouvez et gérez vos conversations archivées.</p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher dans les archives..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-lg bg-card/50 backdrop-blur-xl border-border/50"
        />
      </div>

      {/* Liste des archives */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-[var(--shadow-float)]">
        {filteredArchives.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune conversation archivée trouvée.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredArchives.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground truncate">{chat.title}</h3>
                  <p className="text-xs text-muted-foreground">Archivé le {chat.date}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-8 px-3"
                    onClick={() => handleRestore(chat.id)}
                  >
                    <ArchiveRestoreIcon className="size-4 mr-1" />
                    Restaurer
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-lg h-8 px-3"
                    onClick={() => handleDelete(chat.id)}
                  >
                    <TrashIcon className="size-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
