"use client";

import { PanelLeftIcon, GhostIcon, BellIcon } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { VercelIcon } from "./icons";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { type Notification, getNotifications, subscribeToNotifications, clearNotifications } from "@/lib/notifications";
import { useEffect } from "react";
import { useActiveChat } from "@/hooks/use-active-chat";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const { ghostMode, setGhostMode } = useActiveChat();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
    const unsubscribe = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
    });
    return unsubscribe;
  }, []);

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center justify-between bg-sidebar px-3 w-full">
      <div className="flex items-center gap-2">
        <Button
          className="md:hidden"
          onClick={toggleSidebar}
          size="icon-sm"
          variant="ghost"
        >
          <PanelLeftIcon className="size-4" />
        </Button>

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bouton Fantôme */}
        <Button
          className={ghostMode ? "text-emerald-500" : "text-muted-foreground"}
          onClick={() => {
            setGhostMode(!ghostMode);
            toast.success(ghostMode ? "Mode Fantôme désactivé" : "Mode Fantôme activé");
          }}
          size="icon-sm"
          variant="ghost"
          title="Mode Fantôme"
        >
          <GhostIcon className="size-4" />
        </Button>

        {/* Bouton Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="text-muted-foreground relative"
              size="icon-sm"
              variant="ghost"
              title="Notifications"
            >
              <BellIcon className="size-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 rounded-xl shadow-[var(--shadow-float)]" align="end">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => clearNotifications()}
                >
                  Tout supprimer
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Aucune notification pour le moment.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="text-xs p-2 bg-muted/50 rounded-lg">
                    {notif.text}
                  </div>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
