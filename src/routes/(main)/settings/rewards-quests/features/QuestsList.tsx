'use client';

import { Button, Flexbox } from '@lobehub/ui';
import { Card, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Check, Star } from 'lucide-react';
import React, { useState } from 'react';

import { SparkleExplosion } from '@/components/Gamification/PremiumEffects';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';
import { playGamificationSound } from '@/utils/gamificationSound';

const { Title, Text } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  `,
  section: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  questCard: css`
    width: 100%;
    .ant-card-body {
      padding: 16px;
    }
  `,
  claimButton: css`
    position: relative;
    overflow: hidden;
  `,
  xpBadge: css`
    background: ${token.colorWarning};
    color: #fff;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  bonusButton: css`
    margin-top: 16px;
    align-self: flex-start;
  `
}));

export const QuestsList = () => {
  const { styles } = useStyles();
  const claimDaily = useGamificationStore((s) => s.claimDailyQuest);
  const claimWeekly = useGamificationStore((s) => s.claimWeeklyQuest);
  const addXp = useGamificationStore((s) => s.addXp);
  const soundVolume = useGamificationStore(gamificationSelectors.soundVolume);
  const enableAnimations = useGamificationStore(gamificationSelectors.enableAnimations);
  
  // Simulation des quêtes actives pour l'exemple
  const [activeDaily, setActiveDaily] = useState(dailyQuestsData.map(q => ({ ...q, claimed: false })));
  const [activeWeekly, setActiveWeekly] = useState(weeklyQuestsData.map(q => ({ ...q, claimed: false })));

  const handleClaimDaily = (questId: string, xp: number) => {
    claimDaily(questId);
    addXp(xp);
    if (enableAnimations) {
      setExplodingQuest(questId);
    }
    playGamificationSound('questClaim', soundVolume);
    setActiveDaily(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
  };

  const handleClaimWeekly = (questId: string, xp: number) => {
    claimWeekly(questId);
    addXp(xp);
    if (enableAnimations) {
      setExplodingQuest(questId);
    }
    playGamificationSound('questClaim', soundVolume);
    setActiveWeekly(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
  };

  const [explodingQuest, setExplodingQuest] = useState<string | null>(null);

  const renderQuestCard = (quest: any, onClaim: () => void) => {
    return (
      <Card className={styles.questCard} key={quest.id}>
        <Flexbox align="center" horizontal justify="space-between">
          <Flexbox gap={4}>
            <Title level={5} style={{ margin: 0 }}>{quest.title}</Title>
            <Text type="secondary">{quest.description}</Text>
          </Flexbox>
          <Flexbox align="center" gap={12} horizontal>
            <div className={styles.xpBadge}>
              <Star size={12} fill="currentColor" /> {quest.rewardXp} XP
            </div>
            <div style={{ position: 'relative' }}>
              <Button
                className={styles.claimButton}
                disabled={quest.claimed}
                onClick={onClaim}
                type={quest.claimed ? 'default' : 'primary'}
              >
                {quest.claimed ? <Check size={16} /> : 'Réclamer'}
                {explodingQuest === quest.id && <SparkleExplosion active={true} onComplete={() => setExplodingQuest(null)} />}
              </Button>
            </div>
          </Flexbox>
        </Flexbox>
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Flexbox align="center" horizontal justify="space-between">
          <Title level={4} style={{ margin: 0 }}>Quêtes Journalières</Title>
          <Text type="secondary">Réinitialisation à minuit CET</Text>
        </Flexbox>
        {activeDaily.map(q => renderQuestCard(q, () => handleClaimDaily(q.id, q.rewardXp)))}
        
        <Button className={styles.bonusButton} onClick={() => {
          // Logique pour générer 3 nouvelles quêtes (mocked here)
        }}>
          Obtenir 3 quêtes supplémentaires (1/semaine)
        </Button>
      </div>

      <div className={styles.section}>
        <Flexbox align="center" horizontal justify="space-between">
          <Title level={4} style={{ margin: 0 }}>Quêtes Hebdomadaires</Title>
          <Text type="secondary">Réinitialisation lundi à minuit CET</Text>
        </Flexbox>
        {activeWeekly.map(q => renderQuestCard(q, () => handleClaimWeekly(q.id, q.rewardXp)))}
      </div>
    </div>
  );
};

export default QuestsList;
