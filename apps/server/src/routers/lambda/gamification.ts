import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
import { xpTransactions } from '@lobechat/database/schemas';
import { GamificationService } from '@/server/services/gamification/GamificationService';
import { QuestService } from '@/server/services/gamification/QuestService';

export const gamificationRouter = router({
  getProgression: authedProcedure.query(async ({ ctx }) => {
    const gamificationService = new GamificationService(ctx.db, ctx.userId);
    return gamificationService.getProgression();
  }),

  // Quests
  assignQuests: authedProcedure.mutation(async ({ ctx }) => {
    const questService = new QuestService(ctx.db, ctx.userId);
    return questService.assignQuests();
  }),

  getActiveQuests: authedProcedure.query(async ({ ctx }) => {
    // This could just return the data, but first make sure they have quests assigned
    const questService = new QuestService(ctx.db, ctx.userId);
    await questService.assignQuests(); // Idempotent assignment

    // We can just query `userQuests` for the active periods
    const { getDateKeyCET, getWeeklyKeyCET } = await import('@/server/services/gamification/utils');
    const dailyKey = getDateKeyCET();
    const weeklyKey = getWeeklyKeyCET();

    const quests = await ctx.db.query.userQuests.findMany({
      where: (userQuests, { and, eq, inArray }) => and(
        eq(userQuests.userId, ctx.userId),
        inArray(userQuests.periodKey, [dailyKey, weeklyKey])
      )
    });

    return quests;
  }),

  claimQuest: authedProcedure
    .input(z.object({ userQuestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const questService = new QuestService(ctx.db, ctx.userId);
      return questService.claimQuest(input.userQuestId);
    }),

  // Badges
  getBadges: authedProcedure.query(async ({ ctx }) => {
    // Return all badges, plus the user's unlocked badges
    const userBadgesList = await ctx.db.query.userBadges.findMany({
      where: (userBadges, { eq }) => eq(userBadges.userId, ctx.userId)
    });

    // Asynchronously trigger checkAndUnlockBadges in background so they are updated
    // without blocking the GET request.
    const { BadgeService } = await import('@/server/services/gamification/BadgeService');
    const badgeService = new BadgeService(ctx.db, ctx.userId);
    badgeService.checkAndUnlockBadges().catch(console.error);

    return {
      unlockedIds: userBadgesList.map(b => b.badgeId)
    };
  }),

  // Optional: an endpoint to explicitly trigger checks
  checkBadges: authedProcedure.mutation(async ({ ctx }) => {
    const { BadgeService } = await import('@/server/services/gamification/BadgeService');
    const badgeService = new BadgeService(ctx.db, ctx.userId);
    return badgeService.checkAndUnlockBadges();
  }),

  getXpHistory: authedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.xpTransactions.findMany({
      where: (xpTransactions, { eq }) => eq(xpTransactions.userId, ctx.userId),
      orderBy: (xpTransactions, { desc }) => [desc(xpTransactions.createdAt)],
      limit: 50,
    });
  }),

  resetProgression: authedProcedure.mutation(async ({ ctx }) => {
    const gamificationService = new GamificationService(ctx.db, ctx.userId);
    return gamificationService.resetProgression();
  }),

  cronReset: authedProcedure.mutation(async ({ ctx }) => {
    return { success: true, message: 'Cron processed' };
  })
});
