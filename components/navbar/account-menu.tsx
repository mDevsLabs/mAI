"use client";

import {
  Activity,
  ChevronDown,
  Cloud,
  Gauge,
  Image as ImageIcon,
  LogOut,
  UserRound,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { handleAccountAnchorClick } from "@/components/navbar/account-anchor";
import { StorageMeter } from "@/components/navbar/storage-meter";
import type { NavbarAccount } from "@/components/navbar/use-navbar-account";

interface AccountMenuProps {
  pathname: string;
  account: NavbarAccount;
}

export function AccountMenu({ pathname, account }: AccountMenuProps) {
  return (
    <div className="hidden md:block relative group/account py-2">
      <Link
        href={account.accountHref}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] ${
          pathname.startsWith("/account")
            ? "border-purple-300 bg-purple-50 text-purple-700 shadow-2xs"
            : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10 hover:scale-105"
        }`}
        title={account.isAuthenticated ? `Compte (${account.user?.tier || "Free"})` : "Se connecter"}
      >
        {account.user?.avatarUrl ? (
          <img
            src={account.user.avatarUrl}
            alt="Avatar"
            className="w-6 h-6 rounded-full object-cover bg-white ring-1 ring-black/10 shadow-2xs"
          />
        ) : account.accountInitials ? (
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
            {account.accountInitials}
          </span>
        ) : (
          <UserRound className="w-4 h-4" />
        )}
        <span className="max-w-[100px] truncate">
          {account.loading ? "…" : account.accountLabel}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/account:rotate-180 transition-transform duration-200" />
      </Link>

      {/* Menu déroulant Compte */}
      <div className="absolute right-0 top-full pt-2 origin-top opacity-0 translate-y-2 scale-[0.98] invisible group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:scale-100 group-hover/account:visible group-focus-within/account:opacity-100 group-focus-within/account:translate-y-0 group-focus-within/account:scale-100 group-focus-within/account:visible transition-[opacity,transform] duration-200 z-50">
        <div className="glass-dropdown w-64 space-y-1">
          {account.isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="block p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-slate-900 text-sm truncate">
                    {account.user?.username || "Utilisateur"}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase">
                    {account.user?.tier || "Free"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{account.user?.email}</p>
              </Link>

              <div className="pt-1 space-y-0.5">
                <Link
                  href="/account#usage-mai"
                  onClick={() => handleAccountAnchorClick(pathname, "usage-mai")}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                >
                  <Gauge className="w-4 h-4 text-purple-600" />
                  Usage mAI
                </Link>
                <Link
                  href="/account#usage-api"
                  onClick={() => handleAccountAnchorClick(pathname, "usage-api")}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                >
                  <Activity className="w-4 h-4 text-purple-600" />
                  Usage API
                </Link>
                <Link
                  href="/account#usage-images"
                  onClick={() => handleAccountAnchorClick(pathname, "usage-images")}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                >
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  Usage Images
                </Link>
                <Link
                  href="/account#usage-audio"
                  onClick={() => handleAccountAnchorClick(pathname, "usage-audio")}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                >
                  <Volume2 className="w-4 h-4 text-purple-600" />
                  Usage Audio
                </Link>
                <Link
                  href="/account#usage-cloud"
                  onClick={() => handleAccountAnchorClick(pathname, "usage-cloud")}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex flex-col gap-1.5 group/storage"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Cloud className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Stockage Cloud</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 group-hover/storage:text-purple-700">
                      {account.storagePercent}%
                    </span>
                  </div>
                  <StorageMeter
                    used={account.storageUsed}
                    limit={account.storageLimit}
                    percent={account.storagePercent}
                    variant="desktop"
                  />
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    account.logout();
                    toast.success("Déconnecté avec succès");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          ) : (
            <div className="p-2 space-y-1">
              <Link
                href="/account/login"
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                Se connecter
              </Link>
              <Link
                href="/account/register"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
