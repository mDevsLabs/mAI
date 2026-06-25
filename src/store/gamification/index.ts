import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { lambdaClient } from '@/libs/trpc/client';

export interface GamificationState {
  totalXp: number;
  currentLevel: number;
  activeQuests: any[];
  unlockedBadgeIds: string[];
  
  loading: boolean;
  refreshProgression: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  claimQuest: (userQuestId: string) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>()(
  devtools(
    (set, get) => ({
      totalXp: 0,
      currentLevel: 1,
      activeQuests: [],
      unlockedBadgeIds: [],
      loading: false,

      refreshProgression: async () => {
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
        set({ loading: true });
        try {
          const quests = await lambdaClient.gamification.getActiveQuests.query();
          set({ activeQuests: quests });
        } finally {
          set({ loading: false });
        }
      },

      refreshBadges: async () => {
        set({ loading: true });
        try {
          const data = await lambdaClient.gamification.getBadges.query();
          set({ unlockedBadgeIds: data.unlockedIds });
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
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'GamificationStore' }
  )
);
