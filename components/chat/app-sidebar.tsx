/**
 * Sidebar principale de mAI
 * Contient la navigation, les liens vers Projets/Bibliothèque/Applications,
 * l'historique des conversations et les actions globales.
 * 
 * @version 0.0.3
 */
"use client";

import {
  BookOpenIcon,
  FolderIcon,
  LayoutGridIcon,
  PenSquareIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { addNotification } from "@/lib/notifications";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/chat/sidebar-history";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";


// Liens de navigation principaux
const navLinks = [
  {
    label: "Projets",
    href: "/projects",
    icon: FolderIcon,
    tooltip: "Projets",
  },
  {
    label: "Bibliothèque",
    href: "/library",
    icon: BookOpenIcon,
    tooltip: "Bibliothèque",
  },
  {
    label: "Applications",
    href: "/applications",
    icon: LayoutGridIcon,
    tooltip: "Applications",
  },
];

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(false);
    router.replace("/");
    mutate(unstable_serialize(getChatHistoryPaginationKey), [], {
      revalidate: false,
    });

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, {
      method: "DELETE",
    });
    
    toast.success("Toutes les discussions ont été supprimées");
    addNotification("Toutes les discussions ont été supprimées");
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="pb-0 pt-3">
          <div className="flex items-center gap-2 px-2">
            {/* Logo/Étoile */}
            <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <Image alt="Logo" className="size-5" src="/logo.png" width={20} height={20} />
            </div>
            
            {/* Barre de recherche */}
            <div className="relative flex-1 group-data-[collapsible=icon]:hidden">
              <input
                type="text"
                placeholder="Recherche globale... (Ctrl+K)"
                className="w-full h-8 pl-8 pr-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <svg
                className="absolute left-2.5 top-2.5 size-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            {/* Trigger pour replier (visible si non replié) */}
            <div className="group-data-[collapsible=icon]:hidden ml-auto">
              <SidebarTrigger className="text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="pt-1">
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Nouvelle discussion */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-10 rounded-full border border-sidebar-border text-[14px] text-sidebar-foreground/80 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-sidebar-foreground"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/");
                    }}
                    tooltip="Nouvelle discussion"
                  >
                    <PenSquareIcon className="size-5" />
                    <span className="font-semibold">Nouvelle discussion</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Liens de navigation : Projets, Bibliothèque, Applications */}
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        className={`h-10 rounded-full text-[14px] transition-colors duration-150 ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-800 text-sidebar-foreground font-semibold"
                            : "text-sidebar-foreground/70 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-sidebar-foreground"
                        }`}
                        tooltip={link.tooltip}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpenMobile(false)}
                        >
                          <link.icon className="size-5" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Tout supprimer */}
                {user && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="rounded-lg text-sidebar-foreground/40 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setShowDeleteAllDialog(true)}
                      tooltip="Supprimer toutes les discussions"
                    >
                      <TrashIcon className="size-4" />
                      <span className="text-[13px]">Tout supprimer</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarHistory user={user} />
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border pt-2 pb-3">
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toutes les discussions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement
              toutes vos discussions de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Tout supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
