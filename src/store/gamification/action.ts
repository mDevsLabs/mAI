import { StateCreator } from 'zustand/vanilla';

import { GamificationStoreState, INITIAL_GAMIFICATION_STATE } from './initialState';

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
  setEnableNotifications: (enable: boolean) => void;
  setTimezone: (timezone: string) => void;
  resetProgression: () => void;
  unlockBadge: (badgeId: string) => void;
  unpinBadge: (badgeId: string) => void;
  unpinAllBadges: () => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  trackAction: (actionId: string, count?: number) => void;
  addBonusQuests: (quests: any[]) => boolean;
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
        const newLevel = Math.floor(newXp / 200) + 1; // Basic curve: 200 MP per level
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
          q.questId === questId && q.completed ? { ...q, claimed: true } : q
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
          q.questId === questId && q.completed ? { ...q, claimed: true } : q
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

  setEnableNotifications: (enable) => {
    set(
      (state) => ({ settings: { ...state.settings, enableNotifications: enable } }),
      false,
      'gamification/setEnableNotifications'
    );
  },

  setTimezone: (timezone) => {
    set(
      (state) => ({
        settings: {
          ...state.settings,
          timezone,
          timezoneLastChanged: Date.now(),
        },
      }),
      false,
      'gamification/setTimezone'
    );
  },

  resetProgression: () => {
    set(
      (state) => ({
        ...INITIAL_GAMIFICATION_STATE,
        // Preserve settings but reset progression stats
        xp: 0,
        level: 1,
        activeDailyQuests: [],
        activeWeeklyQuests: [],
        unlockedBadges: [],
        pinnedBadges: [],
        actionCounts: {},
      }),
      false,
      'gamification/resetProgression'
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

  updateQuestProgress: (questId, progress) => {
    set(
      (state) => {
        let updated = false;
        const activeDailyQuests = state.activeDailyQuests.map((q) => {
          if (q.questId === questId) {
            updated = true;
            // Assuming target is checked by the component or we pass completed boolean
            // Wait, we need the target. Let's assume the caller passes the new progress.
            // But we don't know the target here easily without importing JSONs.
            // Let's just update the progress. The completion check could be done here if we import JSONs.
            return { ...q, progress };
          }
          return q;
        });

        if (updated) return { activeDailyQuests };

        const activeWeeklyQuests = state.activeWeeklyQuests.map((q) => {
          if (q.questId === questId) {
            return { ...q, progress };
          }
          return q;
        });
        return { activeWeeklyQuests };
      },
      false,
      'gamification/updateQuestProgress'
    );
  },

  addBonusQuests: (quests) => {
    let success = false;
    set(
      (state) => {
        const now = Date.now();
        const lastTimestamp = state.lastBonusClaimedTimestamp || 0;
        const isNewDay = new Date(lastTimestamp).toDateString() !== new Date(now).toDateString();
        const currentCount = isNewDay ? 0 : (state.bonusClaimsTodayCount || 0);

        if (currentCount >= 3) {
          success = false;
          return {};
        }

        const newQuests = quests.map((q) => ({
          questId: q.id,
          progress: 0,
          completed: false,
          claimed: false,
          assignedAt: now,
        }));

        success = true;
        return {
          activeDailyQuests: [...state.activeDailyQuests, ...newQuests],
          bonusClaimsTodayCount: currentCount + 1,
          lastBonusClaimedTimestamp: now,
        };
      },
      false,
      'gamification/addBonusQuests'
    );
    return success;
  },

  trackAction: (actionId, count = 1) => {
    set(
      (state) => {
        const currentCount = state.actionCounts[actionId] || 0;
        return {
          actionCounts: {
            ...state.actionCounts,
            [actionId]: currentCount + count,
          },
        };
      },
      false,
      'gamification/trackAction'
    );
  },
});
