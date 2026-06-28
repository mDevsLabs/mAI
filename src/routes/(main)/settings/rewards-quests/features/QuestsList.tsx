'use client';

import { Button, Flexbox } from '@lobehub/ui';
import { Card, Typography, Progress, message } from 'antd';
import { createStyles } from 'antd-style';
import { Check, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SparkleExplosion } from '@/components/Gamification/PremiumEffects';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';
import { playGamificationSound } from '@/utils/gamificationSound';
import { useQuestsManager } from '../hooks/useQuestsManager';

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
  const { t } = useTranslation('setting');
  useQuestsManager(); // Run quest management initialization
  const { styles } = useStyles();
  const claimDaily = useGamificationStore((s) => s.claimDailyQuest);
  const claimWeekly = useGamificationStore((s) => s.claimWeeklyQuest);
  const addXp = useGamificationStore((s) => s.addXp);
  const soundVolume = useGamificationStore(gamificationSelectors.soundVolume);
  const enableAnimations = useGamificationStore(gamificationSelectors.enableAnimations);
  
  const storeActiveDaily = useGamificationStore((s) => s.activeDailyQuests);
  const storeActiveWeekly = useGamificationStore((s) => s.activeWeeklyQuests);
  
  const activeDaily = storeActiveDaily.map(aq => {
    const q = dailyQuestsData.find((d: any) => d.id === aq.questId) || {} as any;
    return { ...q, ...aq };
  });

  const activeWeekly = storeActiveWeekly.map(aq => {
    const q = weeklyQuestsData.find((d: any) => d.id === aq.questId) || {} as any;
    return { ...q, ...aq };
  });

  const handleClaimDaily = (questId: string, xp: number) => {
    claimDaily(questId);
    addXp(xp);
    if (enableAnimations) {
      setExplodingQuest(questId);
    }
    playGamificationSound('questClaim', soundVolume);
  };

  const handleClaimWeekly = (questId: string, xp: number) => {
    claimWeekly(questId);
    addXp(xp);
    if (enableAnimations) {
      setExplodingQuest(questId);
    }
    playGamificationSound('questClaim', soundVolume);
  };

  const addBonusQuests = useGamificationStore((s) => s.addBonusQuests);

  const handleGetBonusQuests = () => {
    const activeIds = activeDaily.map((d) => d.id);
    const availableQuests = dailyQuestsData.filter((d) => !activeIds.includes(d.id));

    if (availableQuests.length < 3) {
      message.error('Pas assez de quêtes quotidiennes disponibles.');
      return;
    }

    const shuffled = [...availableQuests].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const success = addBonusQuests(selected);
    if (success) {
      message.success('3 nouvelles quêtes quotidiennes ont été ajoutées !');
      playGamificationSound('questClaim', soundVolume);
    } else {
      message.error("Vous avez déjà pris vos 3 quêtes quotidiennes supplémentaires pour aujourd'hui !");
    }
  };

  const [explodingQuest, setExplodingQuest] = useState<string | null>(null);

  const renderQuestCard = (quest: any, onClaim: () => void) => {
    if (!quest.title) return null;
    const target = quest.requirements?.target || 1;
    const progressPercent = Math.min(100, Math.floor((quest.progress / target) * 100));

    return (
      <Card className={styles.questCard} key={quest.id || quest.questId}>
        <Flexbox align="center" horizontal justify="space-between">
          <Flexbox gap={4} style={{ flex: 1, paddingRight: 16 }}>
            <Title level={5} style={{ margin: 0 }}>{quest.title}</Title>
            <Text type="secondary">{quest.description}</Text>
            <Progress percent={progressPercent} size="small" status={quest.completed ? 'success' : 'normal'} format={() => `${quest.progress} / ${target}`} />
          </Flexbox>
          <Flexbox align="center" gap={12} horizontal>
            <div className={styles.xpBadge}>
              <Star size={12} fill="currentColor" /> {quest.xpReward} MP
            </div>
            <div style={{ position: 'relative' }}>
              <Button
                className={styles.claimButton}
                disabled={quest.claimed || !quest.completed}
                onClick={onClaim}
                type={quest.claimed ? 'default' : 'primary'}
              >
                {quest.claimed ? <Check size={16} /> : t('gamification.quests.claim', 'Réclamer')}
                {explodingQuest === (quest.id || quest.questId) && <SparkleExplosion active={true} onComplete={() => setExplodingQuest(null)} />}
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
          <Title level={4} style={{ margin: 0 }}>{t('gamification.quests.dailyTitle', 'Quêtes quotidiennes')}</Title>
          <Text type="secondary">{t('gamification.quests.dailyDesc', 'Réinitialisation à minuit CET')}</Text>
        </Flexbox>
        {activeDaily.map(q => renderQuestCard(q, () => handleClaimDaily(q.questId, q.xpReward)))}
        
        <Button className={styles.bonusButton} onClick={handleGetBonusQuests}>
          {t('gamification.quests.bonus', 'Obtenir 3 quêtes quotidiennes supplémentaires (max 3/jour)')}
        </Button>
      </div>

      <div className={styles.section}>
        <Flexbox align="center" horizontal justify="space-between">
          <Title level={4} style={{ margin: 0 }}>{t('gamification.quests.weeklyTitle', 'Quêtes Hebdomadaires')}</Title>
          <Text type="secondary">{t('gamification.quests.weeklyDesc', 'Réinitialisation lundi à minuit CET')}</Text>
        </Flexbox>
        {activeWeekly.map(q => renderQuestCard(q, () => handleClaimWeekly(q.questId, q.xpReward)))}
      </div>
    </div>
  );
};

export default QuestsList;
