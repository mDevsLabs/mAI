import { z } from 'zod';

import { CookerRecipeModel } from '@/database/models/cookerRecipe';
import { messages, topics, topicShares } from '@/database/schemas';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const cookerProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  return opts.next({
    ctx: {
      cookerRecipeModel: new CookerRecipeModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const cookerRouter = router({
  createRecipe: cookerProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        ingredients: z.array(z.string()),
        steps: z.array(z.string()),
        servings: z.number(),
        prepTime: z.number(),
        mode: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const recipe = await ctx.cookerRecipeModel.create(input);
      return { recipe, success: true };
    }),

  getRecipes: cookerProcedure.query(async ({ ctx }) => {
    const recipes = await ctx.cookerRecipeModel.query();
    return { recipes, success: true };
  }),

  deleteRecipe: cookerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.cookerRecipeModel.delete(input.id);
      return { success: true };
    }),

  shareRecipe: cookerProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Créer le topic virtuel de la recette
      const [topic] = await ctx.serverDB
        .insert(topics)
        .values({
          title: input.title,
          userId: ctx.userId,
        })
        .returning();

      if (!topic) {
        throw new Error('Failed to create topic for sharing');
      }

      // 2. Créer le message contenant le texte complet de la recette en Markdown
      const [message] = await ctx.serverDB
        .insert(messages)
        .values({
          role: 'assistant',
          content: input.content,
          topicId: topic.id,
          userId: ctx.userId,
        })
        .returning();

      if (!message) {
        throw new Error('Failed to create message for sharing');
      }

      // 3. Créer l'entrée dans topic_shares avec une visibilité publique "link"
      const [share] = await ctx.serverDB
        .insert(topicShares)
        .values({
          topicId: topic.id,
          userId: ctx.userId,
          visibility: 'link',
        })
        .returning();

      if (!share) {
        throw new Error('Failed to create share link');
      }

      return { shareId: share.id, success: true };
    }),
});
