import { and, desc, eq } from 'drizzle-orm';

import type {NewCookerRecipe } from '../schemas';
import { cookerRecipes } from '../schemas';
import type { LobeChatDatabase } from '../type';

export class CookerRecipeModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewCookerRecipe, 'userId'>) => {
    const [result] = await this.db
      .insert(cookerRecipes)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return this.db
      .delete(cookerRecipes)
      .where(and(eq(cookerRecipes.id, id), eq(cookerRecipes.userId, this.userId)));
  };

  query = async () => {
    return this.db.query.cookerRecipes.findMany({
      orderBy: [desc(cookerRecipes.createdAt)],
      where: eq(cookerRecipes.userId, this.userId),
    });
  };

  findById = async (id: string) => {
    return this.db.query.cookerRecipes.findFirst({
      where: and(eq(cookerRecipes.id, id), eq(cookerRecipes.userId, this.userId)),
    });
  };
}
