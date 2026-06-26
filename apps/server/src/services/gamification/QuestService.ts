import { and, eq, inArray, gte } from 'drizzle-orm';
import { type LobeChatDatabase } from '@lobechat/database';
import { userQuests, xpTransactions } from '@lobechat/database/schemas';
import { QUESTS_CATALOG } from '@lobechat/const';

import { GamificationService, GamificationEventType } from './GamificationService';
import { getDateKeyCET, getWeeklyKeyCET } from './utils';

export class QuestService {
  private db: LobeChatDatabase;
  private userId: string;
  private gamificationService: GamificationService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
    this.gamificationService = new GamificationService(db, userId);
  }

  /**
   * Assigne aléatoirement des quêtes à l'utilisateur s'il n'en a pas pour la période.
   */
  async assignQuests() {
    const dailyKey = getDateKeyCET();
    const weeklyKey = getWeeklyKeyCET();

    return this.db.transaction(async (tx) => {
      // 1. Check existing quests for this period
      const activeQuests = await tx.query.userQuests.findMany({
        where: and(
          eq(userQuests.userId, this.userId),
          inArray(userQuests.periodKey, [dailyKey, weeklyKey])
        ),
      });

      const hasDaily = activeQuests.some(q => q.periodKey === dailyKey);
      const hasWeekly = activeQuests.some(q => q.periodKey === weeklyKey);

      const questsToAssign: any[] = [];

      // 1.5. Récupérer les quêtes récemment assignées pour éviter les doublons/répétitions
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);

      // On récupère l'historique d'attribution des 8 dernières semaines
      const recentQuests = await tx.query.userQuests.findMany({
        where: and(
          eq(userQuests.userId, this.userId),
          gte(userQuests.createdAt, eightWeeksAgo)
        ),
      });

      const recentDailyQuestIds = new Set(
        recentQuests
          .filter(q => q.createdAt >= thirtyDaysAgo)
          .map(q => q.questId)
      );

      const recentWeeklyQuestIds = new Set(
        recentQuests
          .map(q => q.questId)
      );

      // 2. Assign Daily Quests (3 visible quests + all hidden quests)
      if (!hasDaily) {
        const dailyCatalog = QUESTS_CATALOG.filter(q => q.type === 'daily' && !q.isHidden);
        let availableDaily = dailyCatalog.filter(q => !recentDailyQuestIds.has(q.id));
        
        // Comportement de repli (fallback) si pas assez de quêtes quotidiennes disponibles
        if (availableDaily.length < 3) {
          availableDaily = dailyCatalog;
        }

        const selectedDaily = this.pickRandomQuests(availableDaily, 3);
        selectedDaily.forEach(q => {
          questsToAssign.push({
            userId: this.userId,
            questId: q.id,
            periodKey: dailyKey,
          });
        });

        // Add hidden daily quests silently
        const hiddenDaily = QUESTS_CATALOG.filter(q => q.type === 'daily' && q.isHidden);
        hiddenDaily.forEach(q => {
          questsToAssign.push({
            userId: this.userId,
            questId: q.id,
            periodKey: dailyKey,
          });
        });
      }

      // 3. Assign Weekly Quests (5 visible quests + all hidden quests)
      if (!hasWeekly) {
        const weeklyCatalog = QUESTS_CATALOG.filter(q => q.type === 'weekly' && !q.isHidden);
        let availableWeekly = weeklyCatalog.filter(q => !recentWeeklyQuestIds.has(q.id));

        // Comportement de repli (fallback) si pas assez de quêtes hebdomadaires disponibles
        if (availableWeekly.length < 5) {
          availableWeekly = weeklyCatalog;
        }

        const selectedWeekly = this.pickRandomQuests(availableWeekly, 5);
        selectedWeekly.forEach(q => {
          questsToAssign.push({
            userId: this.userId,
            questId: q.id,
            periodKey: weeklyKey,
          });
        });

        // Add hidden weekly quests silently
        const hiddenWeekly = QUESTS_CATALOG.filter(q => q.type === 'weekly' && q.isHidden);
        hiddenWeekly.forEach(q => {
          questsToAssign.push({
            userId: this.userId,
            questId: q.id,
            periodKey: weeklyKey,
          });
        });
      }

      // 4. Insert new quests
      if (questsToAssign.length > 0) {
        await tx.insert(userQuests).values(questsToAssign);
      }

      return {
        assigned: questsToAssign.length > 0,
        dailyKey,
        weeklyKey,
      };
    });
  }

  private pickRandomQuests(catalog: typeof QUESTS_CATALOG, count: number) {
    // Simple random selection. Real implementation could use weights for legendary.
    const shuffled = [...catalog].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Met à jour la progression des quêtes après un événement.
   */
  async processEventForQuests(eventType: GamificationEventType, metadata?: Record<string, any>) {
    // Map events to quest categories
    const categoryMap: Record<string, string> = {
      'message_sent': 'message',
      'task_created': 'task',
      'agent_created': 'agent',
      'companion_action': 'companion',
    };
    const category = categoryMap[eventType];
    if (!category) return;

    const dailyKey = getDateKeyCET();
    const weeklyKey = getWeeklyKeyCET();

    const activeQuests = await this.db.query.userQuests.findMany({
      where: and(
        eq(userQuests.userId, this.userId),
        eq(userQuests.status, 'active'),
        inArray(userQuests.periodKey, [dailyKey, weeklyKey])
      ),
    });

    for (const q of activeQuests) {
      const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
      if (!catalogQuest) continue;

      let isMatch = false;

      // Base event matching
      if (catalogQuest.category === category || catalogQuest.category === 'mixed') {
        isMatch = true;
      }
      
      // Hidden Quests matching based on metadata
      if (eventType === 'message_sent' && metadata) {
        if (catalogQuest.id === 'daily_message_night') {
          const hour = metadata.hour;
          if (hour !== undefined && hour >= 0 && hour < 4) {
            isMatch = true;
          } else {
            isMatch = false; // Override base match if conditions not met
          }
        } else if (catalogQuest.id === 'daily_message_gpt4') {
          const modelId = metadata.model as string;
          if (modelId && (modelId.includes('gpt-4') || modelId.includes('gpt4'))) {
            isMatch = true;
          } else {
            isMatch = false; // Override base match if conditions not met
          }
        }
      }

      if (isMatch) {
        const newProgress = q.progress + 1;
        const status = newProgress >= catalogQuest.objectiveCount ? 'completed' : 'active';
        
        await this.db.update(userQuests)
          .set({ progress: newProgress, status, updatedAt: new Date() })
          .where(eq(userQuests.id, q.id));
      }
    }
  }

  /**
   * Réclame l'XP d'une quête complétée.
   */
  async claimQuest(userQuestId: string) {
    const q = await this.db.query.userQuests.findFirst({
      where: and(
        eq(userQuests.id, userQuestId),
        eq(userQuests.userId, this.userId)
      ),
    });

    if (!q || q.status !== 'completed') {
      throw new Error('Quest is not completed or does not exist');
    }

    const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
    if (!catalogQuest) throw new Error('Quest not found in catalog');

    // Mettre à jour en transaction
    return this.db.transaction(async (tx) => {
      await tx.update(userQuests)
        .set({ status: 'claimed', updatedAt: new Date() })
        .where(eq(userQuests.id, q.id));

      const gamificationResult = await this.gamificationService.addXp(
        catalogQuest.xpReward, 
        'quest', 
        `Quête complétée: ${catalogQuest.title}`
      );

      // Check daily bonus (only consider visible quests)
      if (catalogQuest.type === 'daily' && !catalogQuest.isHidden) {
        const allDailyQuests = await tx.query.userQuests.findMany({
          where: and(
            eq(userQuests.userId, this.userId),
            eq(userQuests.periodKey, q.periodKey)
          ),
        });

        // Filter out hidden quests from the completion check
        const visibleDailyQuests = allDailyQuests.filter(dq => {
          const catQ = QUESTS_CATALOG.find(cat => cat.id === dq.questId);
          return catQ && !catQ.isHidden;
        });

        const allCompleted = visibleDailyQuests.every(dq => dq.status === 'claimed' || dq.status === 'completed');
        // Let's assume we can give bonus immediately if all are at least completed
        // Wait, to prevent double bonus, we should check if we already gave it.
        // For simplicity, we can do this in addXp if source is 'bonus'. We can check `xpTransactions`.
        if (allCompleted) {
          const bonusTx = await tx.query.xpTransactions.findFirst({
            where: and(
              eq(xpTransactions.userId, this.userId),
              eq(xpTransactions.source, 'bonus'),
              eq(xpTransactions.title, `Bonus Quotidien: ${q.periodKey}`)
            )
          });
          
          if (!bonusTx) {
             await this.gamificationService.addXp(
              100,
              'bonus',
              `Bonus Quotidien: ${q.periodKey}`,
              'Toutes les quêtes quotidiennes terminées'
            );
          }
        }
      }

      return gamificationResult;
    });
  }
}
