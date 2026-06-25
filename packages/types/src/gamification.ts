export type QuestType = 'daily' | 'weekly';

export type QuestCategory = 'agent' | 'task' | 'companion' | 'message' | 'mixed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  objectiveCount: number;
  xpReward: number; // usually 25, 150 for legendary
  isLegendary?: boolean;
  isHidden?: boolean;
}

export type BadgeRarity = 'rare' | 'epic' | 'legendary' | 'mythic' | 'ultra';

export type BadgeConditionType = 'agents_created' | 'messages_sent' | 'tasks_created' | 'level_reached';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  xpReward: number;
  conditionType: BadgeConditionType;
  conditionValue: number;
}
