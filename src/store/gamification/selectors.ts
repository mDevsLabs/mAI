import { GamificationStore } from './store';

export const gamificationSelectors = {
  currentXp: (s: GamificationStore) => s.xp,
  currentLevel: (s: GamificationStore) => s.level,
  activeDailyQuests: (s: GamificationStore) => s.activeDailyQuests,
  activeWeeklyQuests: (s: GamificationStore) => s.activeWeeklyQuests,
  unlockedBadges: (s: GamificationStore) => s.unlockedBadges,
  pinnedBadges: (s: GamificationStore) => s.pinnedBadges,
  soundVolume: (s: GamificationStore) => s.settings.soundVolume,
  enableAnimations: (s: GamificationStore) => s.settings.enableAnimations,
  enableNotifications: (s: GamificationStore) => s.settings.enableNotifications,
  timezone: (s: GamificationStore) => s.settings.timezone,
  timezoneLastChanged: (s: GamificationStore) => s.settings.timezoneLastChanged,
  lastBonusQuestsUsed: (s: GamificationStore) => s.lastBonusQuestsUsed,
};
