import { and, eq } from 'drizzle-orm';
import { type LobeChatDatabase } from '@lobechat/database';
import { dailyCounters, userGamification, xpTransactions, userQuests, userBadges } from '@lobechat/database/schemas';

import { calculateLevelInfo, getDateKeyCET, hasLeveledUp } from './utils';

export type GamificationEventType = 'message_sent' | 'task_created' | 'agent_created' | 'companion_action';

export class GamificationService {
  private db: LobeChatDatabase;
  private userId: string;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Enregistre un événement métier et crédite l'XP correspondante
   */
  async trackEvent(eventType: GamificationEventType) {
    let xpAmount = 0;
    let title = '';
    let source = eventType;

    switch (eventType) {
      case 'message_sent':
        xpAmount = 5;
        title = 'Message envoyé';
        break;
      case 'task_created':
        xpAmount = 15;
        title = 'Nouvelle tâche planifiée';
        break;
      case 'agent_created':
        xpAmount = 20;
        title = 'Nouvel agent créé';
        break;
      case 'companion_action':
        xpAmount = 10;
        title = 'Action de compagnon';
        
        // Vérifier le plafond journalier pour les compagnons
        const dateKey = getDateKeyCET();
        const canAdd = await this.checkAndIncrementCompanionCap(dateKey);
        if (!canAdd) {
          // Plafond atteint, on ne donne pas d'XP
          return null; 
        }
        break;
    }

    if (xpAmount > 0) {
      return this.addXp(xpAmount, source, title);
    }
    return null;
  }

  private async checkAndIncrementCompanionCap(dateKey: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      let counter = await tx.query.dailyCounters.findFirst({
        where: and(
          eq(dailyCounters.userId, this.userId),
          eq(dailyCounters.dateKey, dateKey)
        ),
      });

      if (!counter) {
        await tx.insert(dailyCounters).values({
          userId: this.userId,
          dateKey,
          companionActionsCount: 1,
        });
        return true;
      }

      if (counter.companionActionsCount >= 5) {
        return false;
      }

      await tx.update(dailyCounters)
        .set({
          companionActionsCount: counter.companionActionsCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(dailyCounters.userId, this.userId),
          eq(dailyCounters.dateKey, dateKey)
        ));

      return true;
    });
  }

  /**
   * Ajoute de l'XP à l'utilisateur et retourne un objet indiquant si l'utilisateur a passé un niveau.
   */
  async addXp(
    amount: number,
    source: string,
    title: string,
    description?: string,
  ): Promise<{ leveledUp: boolean; newTotalXp: number; newLevel: number }> {
    return this.db.transaction(async (tx) => {
      // 1. Get current progression
      let progression = await tx.query.userGamification.findFirst({
        where: eq(userGamification.userId, this.userId),
      });

      let isNew = false;
      if (!progression) {
        isNew = true;
        progression = {
          userId: this.userId,
          totalXp: 0,
          currentLevel: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
        };
      }

      const oldTotalXp = progression.totalXp;
      const newTotalXp = oldTotalXp + amount;
      const { currentLevel: newLevel } = calculateLevelInfo(newTotalXp);
      const leveledUp = hasLeveledUp(oldTotalXp, newTotalXp);

      // 2. Update progression
      if (isNew) {
        await tx.insert(userGamification).values({
          userId: this.userId,
          totalXp: newTotalXp,
          currentLevel: newLevel,
        });
      } else {
        await tx
          .update(userGamification)
          .set({
            totalXp: newTotalXp,
            currentLevel: newLevel,
            updatedAt: new Date(),
          })
          .where(eq(userGamification.userId, this.userId));
      }

      // 3. Create transaction history
      await tx.insert(xpTransactions).values({
        userId: this.userId,
        title,
        description,
        xpAmount: amount,
        source,
      });

      return {
        leveledUp,
        newTotalXp,
        newLevel,
      };
    });
  }

  /**
   * Get current progression
   */
  async getProgression() {
    const progression = await this.db.query.userGamification.findFirst({
      where: eq(userGamification.userId, this.userId),
    });

    if (!progression) {
      return { totalXp: 0, currentLevel: 1 };
    }

    return progression;
  }

  /**
   * Reset all gamification data for the user
   */
  async resetProgression() {
    return this.db.transaction(async (tx) => {
      await tx.delete(xpTransactions).where(eq(xpTransactions.userId, this.userId));
      await tx.delete(userBadges).where(eq(userBadges.userId, this.userId));
      await tx.delete(userQuests).where(eq(userQuests.userId, this.userId));
      await tx.delete(dailyCounters).where(eq(dailyCounters.userId, this.userId));
      await tx.delete(userGamification).where(eq(userGamification.userId, this.userId));
      return { success: true };
    });
  }
}

