import { index, jsonb, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from './user';
import { workspaces } from './workspace';

export const userInstalledPlugins = pgTable(
  'user_installed_plugins',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }),
    manifest: jsonb('manifest'),
    settings: jsonb('settings'),
    customParams: jsonb('custom_params'),
    source: varchar('source', { length: 255 }),
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    accessedAt: timestamp('accessed_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.identifier] }),
    index('user_installed_plugins_workspace_id_idx').on(t.workspaceId),
  ],
);

export type InstalledPluginItem = typeof userInstalledPlugins.$inferSelect;
export type NewInstalledPlugin = typeof userInstalledPlugins.$inferInsert;
