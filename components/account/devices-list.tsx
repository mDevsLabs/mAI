"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Smartphone, 
  Trash2, 
  Edit2, 
  Loader2, 
  Check, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Clock, 
  LogOut,
  Search,
  Laptop,
  Ban,
  Unlock
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";

type Device = {
  id: string;
  os: string;
  device_model: string;
  device_version: string;
  ip_address: string;
  device_name: string;
  last_active: string;
  created_at?: string;
  is_current?: boolean;
  is_blocked?: boolean;
};

export function DevicesList() {
  const { token, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDisconnectOthers, setConfirmDisconnectOthers] = useState(false);

  const fetchDevices = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/devices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      } else {
        console.error("Devices fetch error:", res.status, await res.text());
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la récupération des appareils.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  const [showBlocked, setShowBlocked] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    setActionLoading(`rename-${id}`);
    try {
      const res = await fetch(`/api/v1/devices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ device_name: editName.trim() }),
      });
      if (res.ok) {
        toast.success("Nom de l'appareil mis à jour !");
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? { ...d, device_name: editName.trim() } : d))
        );
        setEditingId(null);
      } else {
        toast.error("Erreur lors du renommage");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (device: Device) => {
    setActionLoading(`delete-${device.id}`);
    try {
      const res = await fetch(`/api/v1/devices/${device.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      if (res.ok) {
        if (device.is_current) {
          toast.success("Session actuelle fermée");
          logout();
          return;
        }
        toast.success("Appareil déconnecté avec succès");
        setDevices((prev) => prev.filter((d) => d.id !== device.id));
      } else {
        toast.error("Erreur lors de la déconnexion");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnectOthers = async () => {
    setActionLoading("disconnect-others");
    try {
      const res = await fetch("/api/v1/devices/others", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      if (res.ok) {
        toast.success("Toutes les autres sessions ont été révoquées Verrou");
        setDevices((prev) => prev.filter((d) => d.is_current));
        setConfirmDisconnectOthers(false);
      } else {
        toast.error("Erreur lors de la déconnexion des autres appareils");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSeconds < 60) return "À l'instant";
      if (diffSeconds < 3600) return `Il y a ${Math.floor(diffSeconds / 60)} min`;
      if (diffSeconds < 86400) return `Il y a ${Math.floor(diffSeconds / 3600)}h`;
      return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const handleBlockDevice = async (device: Device) => {
    setActionLoading(`block-${device.id}`);
    try {
      const newStatus = !device.is_blocked;
      const res = await fetch(`/api/v1/devices/${device.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ is_blocked: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus ? "Appareil bloqué" : "Appareil débloqué");
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, is_blocked: newStatus } : d))
        );
      } else {
        toast.error("Erreur lors de l'opération");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchStatus = showBlocked ? d.is_blocked : !d.is_blocked;
    if (!matchStatus) return false;
    
    if (!q) return true;
    return (
      d.device_name?.toLowerCase().includes(q) ||
      d.device_model?.toLowerCase().includes(q) ||
      d.device_version?.toLowerCase().includes(q) ||
      d.ip_address?.toLowerCase().includes(q) ||
      d.os?.toLowerCase().includes(q)
    );
  });

  const activeDevicesCount = devices.filter(d => !d.is_blocked).length;
  const blockedDevicesCount = devices.filter(d => d.is_blocked).length;
  const otherDevicesCount = devices.filter((d) => !d.is_current && !d.is_blocked).length;

  if (loading && devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-xs text-slate-500 font-medium">Recherche des appareils connectés...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'actions supérieures */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            {activeDevicesCount} {activeDevicesCount > 1 ? "appareils connectés" : "appareil connecté"}
          </span>
          {devices.some((d) => d.is_current) && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En ligne
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setShowBlocked(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                !showBlocked ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Actifs ({activeDevicesCount})
            </button>
            <button
              onClick={() => setShowBlocked(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                showBlocked ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Bloqués ({blockedDevicesCount})
            </button>
          </div>
          {/* Bouton Actualiser */}
          <button
            onClick={() => fetchDevices(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors border border-slate-200/80 bg-white/70 shadow-2xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Rafraîchir la liste"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-600" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          {/* Déconnecter les autres appareils */}
          {otherDevicesCount > 0 && (
            confirmDisconnectOthers ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 animate-in fade-in">
                <span className="text-[11px] text-red-700 font-bold px-1.5">Confirmer ?</span>
                <button
                  onClick={handleDisconnectOthers}
                  disabled={actionLoading === "disconnect-others"}
                  className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  {actionLoading === "disconnect-others" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Oui"}
                </button>
                <button
                  onClick={() => setConfirmDisconnectOthers(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDisconnectOthers(true)}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors border border-red-200/80 bg-white/70 shadow-2xs text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnecter les autres ({otherDevicesCount})</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Barre de recherche si plus de 2 appareils */}
      {devices.length > 2 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, modèle, IP ou système..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/70 border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all placeholder:text-slate-400 text-slate-900"
          />
        </div>
      )}

      {/* Liste des appareils */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-8 rounded-2xl bg-white/40 border border-dashed border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Aucun appareil correspondant à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredDevices.map((device) => {
            let iconPath = "/devices/linux.png";
            if (device.os === "apple") iconPath = "/devices/apple.png";
            else if (device.os === "microsoft") iconPath = "/devices/microsoft.png";
            else if (device.os === "google") iconPath = "/devices/google.png";

            const isEditing = editingId === device.id;
            const isPhone = device.os === "google" || (device.os === "apple" && (device.device_version?.includes("iPhone") || device.device_model?.includes("iPhone")));

            return (
              <div
                key={device.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
                  device.is_current 
                    ? "bg-purple-50/50 border-2 border-purple-300 shadow-sm" 
                    : "bg-white/70 border border-slate-200/80 hover:border-purple-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Logo OS / Plateforme */}
                  <div className="relative w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center p-2.5 border border-slate-100 shrink-0">
                    <img 
                      src={iconPath} 
                      alt={device.os} 
                      className="w-full h-full object-contain" 
                      onError={(e) => {
                        // Fallback icon si l'image n'est pas trouvée
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    {device.is_current && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
                    )}
                  </div>

                  {/* Infos Appareil */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 my-0.5">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2.5 py-1 text-xs font-bold border-2 border-purple-400 rounded-lg focus:outline-none bg-white text-slate-900 shadow-2xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(device.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => handleRename(device.id)}
                            disabled={actionLoading === `rename-${device.id}`}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Sauvegarder"
                          >
                            {actionLoading === `rename-${device.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                            {device.device_name}
                          </h4>
                          <button
                            onClick={() => {
                              setEditingId(device.id);
                              setEditName(device.device_name);
                            }}
                            className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer p-0.5"
                            title="Renommer l'appareil"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Badge Session Actuelle */}
                      {device.is_current && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Cet appareil
                        </span>
                      )}
                    </div>

                    {/* Métadonnées & Badges */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium mt-1">
                      <span className="inline-flex items-center gap-1">
                        {isPhone ? <Smartphone className="w-3 h-3 text-slate-400" /> : <Laptop className="w-3 h-3 text-slate-400" />}
                        {device.device_version || device.device_model}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        IP : {device.ip_address}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {device.is_current ? "Actif maintenant" : `Activité : ${formatRelativeTime(device.last_active)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  {/* Bouton Bloquer/Débloquer */}
                  {!device.is_current && (
                    <button
                      onClick={() => handleBlockDevice(device)}
                      disabled={actionLoading === `block-${device.id}`}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                        device.is_blocked
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100"
                      }`}
                      title={device.is_blocked ? "Débloquer l'appareil" : "Bloquer l'appareil"}
                    >
                      {actionLoading === `block-${device.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : device.is_blocked ? (
                        <Unlock className="w-3.5 h-3.5" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      <span>{device.is_blocked ? "Débloquer" : "Bloquer"}</span>
                    </button>
                  )}

                  {/* Bouton de Déconnexion */}
                  <button
                    onClick={() => handleDisconnect(device)}
                    disabled={actionLoading === `delete-${device.id}`}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                      device.is_current
                        ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600"
                        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                    }`}
                    title={device.is_current ? "Fermer cette session" : "Déconnecter cet appareil"}
                  >
                    {actionLoading === `delete-${device.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{device.is_current ? "Se déconnecter" : "Déconnecter"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

