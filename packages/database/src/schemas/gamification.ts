import { sql } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '../utils/idGenerator';
import { timestamps, varchar255 } from './_helpers';
import { users } from './user';

export const userGamification = pgTable(
  'user_gamification',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    totalXp: integer('total_xp').notNull().default(0),
    currentLevel: integer('current_level').notNull().default(1),
    ...timestamps,
  },
  (t) => [index('user_gamification_user_id_idx').on(t.userId)]
);

export const xpTransactions = pgTable(
  'xp_transactions',
  {
    id: varchar255('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('xpTx'))
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    description: text('description'),
    xpAmount: integer('xp_amount').notNull(),
    source: varchar255('source').notNull(), // 'message', 'agent', 'task', 'quest', 'badge', 'bonus'
    ...timestamps,
  },
  (t) => [
    index('xp_transactions_user_id_created_at_idx').on(t.userId, t.createdAt),
  ]
);

export const userQuests = pgTable(
  'user_quests',
  {
    id: varchar255('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('quest'))
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    questId: varchar255('quest_id').notNull(), // ID in the JSON catalog
    progress: integer('progress').notNull().default(0),
    status: varchar255('status').notNull().default('active'), // 'active', 'completed', 'claimed'
    periodKey: varchar255('period_key').notNull(), // e.g. '2026-06-25' or '2026-W26'
    ...timestamps,
  },
  (t) => [
    index('user_quests_user_id_idx').on(t.userId),
    uniqueIndex('user_quests_user_quest_period_idx').on(t.userId, t.questId, t.periodKey),
  ]
);

export const userBadges = pgTable(
  'user_badges',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    badgeId: varchar255('badge_id').notNull(), // ID in the JSON catalog
    unlockedAt: timestamps.createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.badgeId] }),
    index('user_badges_user_id_idx').on(t.userId),
  ]
);

export const dailyCounters = pgTable(
  'daily_counters',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    dateKey: varchar255('date_key').notNull(), // '2026-06-25'
    companionActionsCount: integer('companion_actions_count').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.dateKey] }),
  ]
);

export const insertUserGamificationSchema = createInsertSchema(userGamification);
export const insertXpTransactionSchema = createInsertSchema(xpTransactions);
export const insertUserQuestSchema = createInsertSchema(userQuests);
export const insertUserBadgeSchema = createInsertSchema(userBadges);
export const insertDailyCounterSchema = createInsertSchema(dailyCounters);

export type UserGamification = typeof userGamification.$inferSelect;
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type UserQuest = typeof userQuests.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type DailyCounter = typeof dailyCounters.$inferSelect;
