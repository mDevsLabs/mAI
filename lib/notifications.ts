/**
 * Gestionnaire de notifications pour mAI
 * Stocke les notifications dans le localStorage pour persistance.
 * 
 * @version 0.0.5
 */

export type Notification = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "mai-notifications";

function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") { return []; }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setStoredNotifications(notifs: Notification[]) {
  if (typeof window === "undefined") { return; }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

const listeners: ((notifs: Notification[]) => void)[] = [];

export function getNotifications(): Notification[] {
  return getStoredNotifications();
}

export function addNotification(text: string) {
  const notifs = getStoredNotifications();
  const notif = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
  const updated = [notif, ...notifs];
  setStoredNotifications(updated);
  notifyListeners(updated);
}

export function clearNotifications() {
  setStoredNotifications([]);
  notifyListeners([]);
}

export function subscribeToNotifications(listener: (notifs: Notification[]) => void) {
  listeners.push(listener);
  // Retourner une fonction pour se désabonner
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) { listeners.splice(index, 1); }
  };
}

function notifyListeners(notifs: Notification[]) {
  for (const listener of listeners) {
    listener(notifs);
  }
}
