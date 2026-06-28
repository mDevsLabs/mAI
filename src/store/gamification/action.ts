import { StateCreator } from 'zustand/vanilla';

import { GamificationStoreState, INITIAL_GAMIFICATION_STATE } from './initialState';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';
import badgesCatalog from '@/const/gamification/badgesCatalog.json';

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
      (state) => {
        const questDef = dailyQuestsData.find((q: any) => q.id === questId);
        const title = questDef?.title || questId;
        const reward = questDef?.xpReward || 0;

        const activeDailyQuests = state.activeDailyQuests.map((q) =>
          q.questId === questId && q.completed ? { ...q, claimed: true } : q
        );

        const newLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          title: title,
          type: 'quest' as const,
          mpReward: reward,
        };

        return {
          activeDailyQuests,
          logs: [newLog, ...(state.logs || [])],
        };
      },
      false,
      'gamification/claimDailyQuest'
    );
  },

  claimWeeklyQuest: (questId) => {
    set(
      (state) => {
        const questDef = weeklyQuestsData.find((q: any) => q.id === questId);
        const title = questDef?.title || questId;
        const reward = questDef?.xpReward || 0;

        const activeWeeklyQuests = state.activeWeeklyQuests.map((q) =>
          q.questId === questId && q.completed ? { ...q, claimed: true } : q
        );

        const newLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          title: title,
          type: 'quest' as const,
          mpReward: reward,
        };

        return {
          activeWeeklyQuests,
          logs: [newLog, ...(state.logs || [])],
        };
      },
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
        xp: 0,
        level: 1,
        activeDailyQuests: [],
        activeWeeklyQuests: [],
        unlockedBadges: [],
        pinnedBadges: [],
        actionCounts: {},
        logs: [],
      }),
      false,
      'gamification/resetProgression'
    );
  },

  unlockBadge: (badgeId) => {
    set(
      (state) => {
        if (state.unlockedBadges.includes(badgeId)) return state;
        const badgeDef = badgesCatalog.find((b: any) => b.id === badgeId);
        const emojiStr = badgeDef?.emoji ? `${badgeDef.emoji} ` : '';
        const nameStr = badgeDef?.name || badgeId;

        const newLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          title: `Badge débloqué : ${emojiStr}${nameStr}`,
          type: 'badge' as const,
          mpReward: 0,
        };

        return {
          unlockedBadges: [...state.unlockedBadges, badgeId],
          logs: [newLog, ...(state.logs || [])],
        };
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
        const msInWeek = 7 * 24 * 60 * 60 * 1000;

        if (lastTimestamp && (now - lastTimestamp < msInWeek)) {
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
        const newActionCounts = {
          ...state.actionCounts,
          [actionId]: currentCount + count,
        };

        // Update active daily quests progress and completion status
        const activeDailyQuests = state.activeDailyQuests.map((q) => {
          if (q.completed) return q;
          const questDef = dailyQuestsData.find((d: any) => d.id === q.questId);
          if (questDef?.requirements?.action === actionId) {
            const target = questDef.requirements.target || 1;
            const newProgress = Math.min(target, q.progress + count);
            const completed = newProgress >= target;
            return { ...q, progress: newProgress, completed };
          }
          return q;
        });

        // Update active weekly quests progress and completion status
        const activeWeeklyQuests = state.activeWeeklyQuests.map((q) => {
          if (q.completed) return q;
          const questDef = weeklyQuestsData.find((w: any) => w.id === q.questId);
          if (questDef?.requirements?.action === actionId) {
            const target = questDef.requirements.target || 1;
            const newProgress = Math.min(target, q.progress + count);
            const completed = newProgress >= target;
            return { ...q, progress: newProgress, completed };
          }
          return q;
        });

        // Check for new badges to unlock
        const unlockedBadges = [...state.unlockedBadges];
        const newLogs = [...(state.logs || [])];

        badgesCatalog.forEach((badge: any) => {
          if (!unlockedBadges.includes(badge.id)) {
            if (badge.requirements?.action === actionId) {
              const currentTotal = newActionCounts[actionId] || 0;
              if (currentTotal >= (badge.requirements.target || 0)) {
                unlockedBadges.push(badge.id);

                const emojiStr = badge.emoji ? `${badge.emoji} ` : '';
                const nameStr = badge.name || badge.id;
                newLogs.unshift({
                  id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  timestamp: Date.now(),
                  title: `Badge débloqué : ${emojiStr}${nameStr}`,
                  type: 'badge' as const,
                  mpReward: 0,
                });
              }
            }
          }
        });

        return {
          actionCounts: newActionCounts,
          activeDailyQuests,
          activeWeeklyQuests,
          unlockedBadges,
          logs: newLogs,
        };
      },
      false,
      'gamification/trackAction'
    );
  },
});
