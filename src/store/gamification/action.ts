import { StateCreator } from 'zustand/vanilla';

import { GamificationStoreState } from './initialState';

export interface GamificationAction {
  addXp: (xp: number) => void;
  claimDailyQuest: (questId: string) => void;
  claimWeeklyQuest: (questId: string) => void;
  pinBadge: (badgeId: string) => void;
  refreshDailyQuests: (quests: any[]) => void;
  refreshWeeklyQuests: (quests: any[]) => void;
  resetQuestsBonus: () => void;
  setEnableAnimations: (enable: boolean) => void;
  setSoundVolume: (volume: number) => void;
  unlockBadge: (badgeId: string) => void;
  unpinBadge: (badgeId: string) => void;
  unpinAllBadges: () => void;
}

export const gamificationActionSlice: StateCreator<
  GamificationStoreState,
  [['zustand/devtools', never]],
  [],
  GamificationAction
> = (set, get) => ({
  addXp: (xp) => {
    set(
      (state) => {
        const newXp = state.xp + xp;
        const newLevel = Math.floor(newXp / 100) + 1; // Basic curve: 100 XP per level
        return { xp: newXp, level: newLevel };
      },
      false,
      'gamification/addXp'
    );
  },

  claimDailyQuest: (questId) => {
    set(
      (state) => ({
        activeDailyQuests: state.activeDailyQuests.map((q) =>
          q.questId === questId ? { ...q, claimed: true } : q
        ),
      }),
      false,
      'gamification/claimDailyQuest'
    );
  },

  claimWeeklyQuest: (questId) => {
    set(
      (state) => ({
        activeWeeklyQuests: state.activeWeeklyQuests.map((q) =>
          q.questId === questId ? { ...q, claimed: true } : q
        ),
      }),
      false,
      'gamification/claimWeeklyQuest'
    );
  },

  pinBadge: (badgeId) => {
    set(
      (state) => {
        if (state.pinnedBadges.includes(badgeId)) return state;
        return { pinnedBadges: [...state.pinnedBadges, badgeId] };
      },
      false,
      'gamification/pinBadge'
    );
  },

  refreshDailyQuests: (quests) => {
    const now = Date.now();
    set(
      (state) => {
        const newHistory = { ...state.questHistory };
        quests.forEach((q) => {
          newHistory[q.id] = now;
        });

        return {
          activeDailyQuests: quests.map((q) => ({
            questId: q.id,
            progress: 0,
            completed: false,
            claimed: false,
            assignedAt: now,
          })),
          questHistory: newHistory,
        };
      },
      false,
      'gamification/refreshDailyQuests'
    );
  },

  refreshWeeklyQuests: (quests) => {
    const now = Date.now();
    set(
      (state) => {
        const newHistory = { ...state.questHistory };
        quests.forEach((q) => {
          newHistory[q.id] = now;
        });

        return {
          activeWeeklyQuests: quests.map((q) => ({
            questId: q.id,
            progress: 0,
            completed: false,
            claimed: false,
            assignedAt: now,
          })),
          questHistory: newHistory,
        };
      },
      false,
      'gamification/refreshWeeklyQuests'
    );
  },

  resetQuestsBonus: () => {
    set({ lastBonusQuestsUsed: Date.now() }, false, 'gamification/resetQuestsBonus');
  },

  setEnableAnimations: (enable) => {
    set(
      (state) => ({ settings: { ...state.settings, enableAnimations: enable } }),
      false,
      'gamification/setEnableAnimations'
    );
  },

  setSoundVolume: (volume) => {
    set(
      (state) => ({ settings: { ...state.settings, soundVolume: volume } }),
      false,
      'gamification/setSoundVolume'
    );
  },

  unlockBadge: (badgeId) => {
    set(
      (state) => {
        if (state.unlockedBadges.includes(badgeId)) return state;
        return { unlockedBadges: [...state.unlockedBadges, badgeId] };
      },
      false,
      'gamification/unlockBadge'
    );
  },

  unpinBadge: (badgeId) => {
    set(
      (state) => ({
        pinnedBadges: state.pinnedBadges.filter((id) => id !== badgeId),
      }),
      false,
      'gamification/unpinBadge'
    );
  },

  unpinAllBadges: () => {
    set({ pinnedBadges: [] }, false, 'gamification/unpinAllBadges');
  },
});
