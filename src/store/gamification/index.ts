import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { lambdaClient } from '@/libs/trpc/client';

export interface GamificationSettings {
  enableToasts: boolean;
  enableConfetti: boolean;
  enableGamification: boolean;
}

export interface GamificationState {
  totalXp: number;
  currentLevel: number;
  activeQuests: any[];
  unlockedBadgeIds: string[];
  xpHistory: any[];
  settings: GamificationSettings;
  
  loading: boolean;
  refreshProgression: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  refreshXpHistory: () => Promise<void>;
  claimQuest: (userQuestId: string) => Promise<void>;
  resetProgression: () => Promise<void>;
  updateSettings: (settings: Partial<GamificationSettings>) => void;
}

export const useGamificationStore = create<GamificationState>()(
  devtools(
    persist(
      (set, get) => ({
        totalXp: 0,
        currentLevel: 1,
        activeQuests: [],
        unlockedBadgeIds: [],
        xpHistory: [],
        loading: false,
        settings: {
          enableToasts: true,
          enableConfetti: true,
          enableGamification: true,
        },

        refreshProgression: async () => {
          if (!get().settings.enableGamification) return;
          set({ loading: true });
          try {
            const data = await lambdaClient.gamification.getProgression.query();
            set({
              totalXp: data.totalXp,
              currentLevel: data.currentLevel,
            });
          } finally {
            set({ loading: false });
          }
        },

        refreshQuests: async () => {
          if (!get().settings.enableGamification) return;
          set({ loading: true });
          try {
            const quests = await lambdaClient.gamification.getActiveQuests.query();
            set({ activeQuests: quests });
          } finally {
            set({ loading: false });
          }
        },

        refreshBadges: async () => {
          if (!get().settings.enableGamification) return;
          set({ loading: true });
          try {
            const data = await lambdaClient.gamification.getBadges.query();
            set({ unlockedBadgeIds: data.unlockedIds });
          } finally {
            set({ loading: false });
          }
        },

        refreshXpHistory: async () => {
          if (!get().settings.enableGamification) return;
          set({ loading: true });
          try {
            const history = await lambdaClient.gamification.getXpHistory.query();
            set({ xpHistory: history });
          } finally {
            set({ loading: false });
          }
        },

        claimQuest: async (userQuestId: string) => {
          set({ loading: true });
          try {
            await lambdaClient.gamification.claimQuest.mutate({ userQuestId });
            // Refresh data after claiming
            await get().refreshProgression();
            await get().refreshQuests();
            await get().refreshXpHistory();
          } finally {
            set({ loading: false });
          }
        },

        resetProgression: async () => {
          set({ loading: true });
          try {
            await lambdaClient.gamification.resetProgression.mutate();
            // Reset local state
            set({
              totalXp: 0,
              currentLevel: 1,
              activeQuests: [],
              unlockedBadgeIds: [],
              xpHistory: [],
            });
          } finally {
            set({ loading: false });
          }
        },

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: {
              ...state.settings,
              ...newSettings,
            },
          }));
        },
      }),
      {
        name: 'mAI-gamification-settings',
        partialize: (state) => ({ settings: state.settings }), // persist only settings
      }
    ),
    { name: 'GamificationStore' }
  )
);
