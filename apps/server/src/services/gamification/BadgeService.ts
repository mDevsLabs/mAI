import { and, count, eq, isNull } from 'drizzle-orm';
import { type LobeChatDatabase } from '@lobechat/database';
import { agents, messages, tasks, userBadges, userGamification } from '@lobechat/database/schemas';
import { BADGES_CATALOG } from '@lobechat/const';

import { GamificationService } from './GamificationService';

export class BadgeService {
  private db: LobeChatDatabase;
  private userId: string;
  private gamificationService: GamificationService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
    this.gamificationService = new GamificationService(db, userId);
  }

  /**
   * Vérifie les conditions des badges et débloque ceux qui sont remplis.
   * Retourne la liste des badges nouvellement débloqués.
   */
  async checkAndUnlockBadges() {
    // 1. Get unlocked badges to skip them
    const unlocked = await this.db.query.userBadges.findMany({
      where: eq(userBadges.userId, this.userId)
    });
    const unlockedIds = new Set(unlocked.map(b => b.badgeId));

    const badgesToCheck = BADGES_CATALOG.filter(b => !unlockedIds.has(b.id));
    if (badgesToCheck.length === 0) return [];

    // 2. Fetch stats
    const stats = {
      agents_created: 0,
      messages_sent: 0,
      tasks_created: 0,
      level_reached: 1,
    };

    if (badgesToCheck.some(b => b.conditionType === 'agents_created')) {
      const [{ count: c }] = await this.db.select({ count: count() })
        .from(agents)
        .where(eq(agents.userId, this.userId));
      stats.agents_created = Number(c);
    }

    if (badgesToCheck.some(b => b.conditionType === 'messages_sent')) {
      const [{ count: c }] = await this.db.select({ count: count() })
        .from(messages)
        .where(eq(messages.userId, this.userId));
      stats.messages_sent = Number(c);
    }

    if (badgesToCheck.some(b => b.conditionType === 'tasks_created')) {
      const [{ count: c }] = await this.db.select({ count: count() })
        .from(tasks)
        .where(eq(tasks.createdByUserId, this.userId));
      stats.tasks_created = Number(c);
    }

    if (badgesToCheck.some(b => b.conditionType === 'level_reached')) {
      const prog = await this.db.query.userGamification.findFirst({
        where: eq(userGamification.userId, this.userId)
      });
      stats.level_reached = prog?.currentLevel || 1;
    }

    // 3. Unlock badges
    const newlyUnlocked: typeof BADGES_CATALOG = [];

    for (const badge of badgesToCheck) {
      const currentValue = stats[badge.conditionType];
      if (currentValue >= badge.conditionValue) {
        // Unlock
        await this.db.transaction(async (tx) => {
          // Double check in tx to avoid race conditions
          const alreadyUnlocked = await tx.query.userBadges.findFirst({
            where: and(
              eq(userBadges.userId, this.userId),
              eq(userBadges.badgeId, badge.id)
            )
          });

          if (!alreadyUnlocked) {
            await tx.insert(userBadges).values({
              userId: this.userId,
              badgeId: badge.id,
            });

            await this.gamificationService.addXp(
              badge.xpReward, 
              'badge', 
              `Badge débloqué: ${badge.title}`
            );

            newlyUnlocked.push(badge);
          }
        });
      }
    }

    return newlyUnlocked;
  }
}
