'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Typography, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { Pin } from 'lucide-react';
import React from 'react';

import { PremiumCardWrapper } from '@/components/Gamification/PremiumEffects';

const { Text } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    height: 100%;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${token.boxShadowSecondary};
    }
    
    .ant-card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      height: 100%;
    }
  `,
  emoji: css`
    font-size: 48px;
    line-height: 1;
  `,
  locked: css`
    opacity: 0.5;
    filter: grayscale(100%);
  `,
  pinIcon: css`
    position: absolute;
    top: 8px;
    right: 8px;
    color: ${token.colorPrimary};
  `
}));

const getRarityTag = (rarity: string) => {
  const map: Record<string, { color: string; label: string }> = {
    Rare: { color: 'blue', label: 'Rare' },
    Epic: { color: 'purple', label: 'Épique' },
    Legendary: { color: 'gold', label: 'Légendaire' },
    Mythic: { color: 'magenta', label: 'Mythique' },
    Ultra: { color: 'volcano', label: 'Ultra' },
  };
  const config = map[rarity] || { color: 'default', label: rarity };
  return <Tag color={config.color} style={{ fontWeight: 'bold', margin: 0 }}>{config.label}</Tag>;
};

export const BadgeCard = ({ badge, isUnlocked, isPinned, onClick }: any) => {
  const { styles, cx } = useStyles();

  return (
    <PremiumCardWrapper rarity={badge.rarity} active={isUnlocked}>
      <Card 
        className={cx(styles.card, !isUnlocked && styles.locked)} 
        onClick={onClick}
        bordered={!isUnlocked}
      >
        {isPinned && <Pin size={16} className={styles.pinIcon} />}
        <div className={styles.emoji}>{badge.emoji}</div>
        <Flexbox align="center" gap={8}>
          <Text strong>{badge.name}</Text>
          {getRarityTag(badge.rarity)}
        </Flexbox>
      </Card>
    </PremiumCardWrapper>
  );
};
