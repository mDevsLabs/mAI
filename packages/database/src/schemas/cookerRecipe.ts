import { integer, jsonb,pgTable, text } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './user';

export const cookerRecipes = pgTable(
  'cooker_recipes',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    ingredients: jsonb('ingredients').$type<string[]>().notNull(),
    steps: jsonb('steps').$type<string[]>().notNull(),
    servings: integer('servings').notNull(),
    prepTime: integer('prep_time').notNull(),
    mode: text('mode').notNull(),
    ...timestamps,
  }
);

export type CookerRecipeItem = typeof cookerRecipes.$inferSelect;
export type NewCookerRecipe = typeof cookerRecipes.$inferInsert;
