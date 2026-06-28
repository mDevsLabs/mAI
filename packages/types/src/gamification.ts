export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ultra';

export interface GamificationTracking {
  eventType: string;
  condition?: Record<string, string>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  objectiveCount?: number;
  requirements?: {
    action: string;
    target: number;
  };
  category?: string;
  tracking?: GamificationTracking;
  difficulty?: 'Easy' | 'Normal' | 'Hard' | 'Elite' | 'Legendary';
}

export interface Badge {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
  description: string;
  lore?: string;
  conditionDescription?: string;
  requirements?: {
    action: string;
    target: number;
  };
  xpReward?: number;
  rarity: Rarity;
}

export interface UserQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  assignedAt: number; // timestamp
}

export interface GamificationSettings {
  soundVolume: number;
  enableAnimations: boolean;
  enableNotifications: boolean;
  timezone: string;
  timezoneLastChanged: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  settings: GamificationSettings;
  activeDailyQuests: UserQuestProgress[];
  activeWeeklyQuests: UserQuestProgress[];
  questHistory: Record<string, number>; // questId -> last assigned timestamp
  unlockedBadges: string[];
  pinnedBadges: string[];
  lastBonusQuestsUsed: number; // timestamp
  actionCounts: Record<string, number>; // action -> count
}
