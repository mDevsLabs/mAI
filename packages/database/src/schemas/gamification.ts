import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './user';

export const userGamificationLogs = pgTable('user_gamification_logs', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 255 }).notNull(), // e.g. 'claim_daily_quest', 'message_sent'
  xpEarned: integer('xp_earned').notNull(),
  metadata: text('metadata'), // JSON string for extra info
  ...timestamps,
});

export type NewUserGamificationLog = typeof userGamificationLogs.$inferInsert;
export type UserGamificationLogItem = typeof userGamificationLogs.$inferSelect;
