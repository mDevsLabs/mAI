import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'error';

export interface NotificationItem {
  actionPath?: string;
  content: string;
  id: string;
  pinned: boolean;
  read: boolean;
  timestamp: number;
  title: string;
  type: NotificationType;
}

export interface NotificationSettings {
  colors: {
    info: string;
    success: string;
    error: string;
  };
  news: boolean;
  recommendations: boolean;
  sounds: {
    info: boolean;
    success: boolean;
    error: boolean;
  };
  volume: number;
  webPush: boolean;
}

export interface NotificationState {
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'pinned' | 'timestamp'>) => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  notifications: NotificationItem[];
  settings: NotificationSettings;
  togglePin: (id: string) => { success: boolean; error?: string };
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  updateSounds: (sounds: Partial<NotificationSettings['sounds']>) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: {
        recommendations: true,
        news: true,
        webPush: false,
        sounds: {
          info: true,
          success: true,
          error: true,
        },
        colors: {
          info: '#1677ff',
          success: '#52c41a',
          error: '#ff4d4f',
        },
        volume: 50,
      },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      updateSounds: (partial) =>
        set((state) => ({
          settings: { ...state.settings, sounds: { ...state.settings.sounds, ...partial } },
        })),
      addNotification: (item) =>
        set((state) => {
          const newNotif: NotificationItem = {
            ...item,
            id: Math.random().toString(36).slice(2, 11),
            read: false,
            pinned: false,
            timestamp: Date.now(),
          };
          const updated = [newNotif, ...state.notifications].slice(0, 100);

          if (
            state.settings.webPush &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification(newNotif.title, { body: newNotif.content });
          }

          return { notifications: updated };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAsUnread: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
        })),
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
      togglePin: (id) => {
        const state = get();
        const item = state.notifications.find((n) => n.id === id);
        if (!item) return { success: false };

        if (!item.pinned) {
          const pinnedCount = state.notifications.filter((n) => n.pinned).length;
          if (pinnedCount >= 5) {
            return { success: false, error: 'Limite de 5 épingles atteinte' };
          }
        }

        set({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n,
          ),
        });
        return { success: true };
      },
    }),
    { name: 'mai-notifications-storage' },
  ),
);
