'use client';

import { Button, Flexbox } from '@lobehub/ui';
import { Modal, Typography, Progress } from 'antd';
import { createStyles } from 'antd-style';
import { Pin, PinOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PremiumCardWrapper } from '@/components/Gamification/PremiumEffects';
import { useGamificationStore } from '@/store/gamification';

const { Title, Text, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  modalBody: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 24px 0;
  `,
  emojiContainer: css`
    font-size: 80px;
    line-height: 1;
    width: 140px;
    height: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${token.colorFillTertiary};
    border-radius: 24px;
    position: relative;
  `,
  locked: css`
    filter: grayscale(100%);
    opacity: 0.5;
  `,
  infoSection: css`
    text-align: center;
    max-width: 80%;
  `,
  rarityTag: css`
    padding: 4px 12px;
    border-radius: 16px;
    background: ${token.colorFillSecondary};
    font-weight: bold;
    font-size: 14px;
  `
}));

export const BadgeIdentityModal = ({ open, onCancel, badge, isUnlocked, isPinned }: any) => {
  const { t } = useTranslation('setting');
  const { styles, cx } = useStyles();
  const pinBadge = useGamificationStore((s) => s.pinBadge);
  const unpinBadge = useGamificationStore((s) => s.unpinBadge);

  const togglePin = () => {
    if (isPinned) unpinBadge(badge.id);
    else pinBadge(badge.id);
  };

  return (
    <Modal
      footer={
        <Flexbox justify="center">
          <Button
            disabled={!isUnlocked}
            icon={isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            onClick={togglePin}
            type={isPinned ? 'default' : 'primary'}
          >
            {isPinned ? t('gamification.badges.unpin', 'Désépingler du profil') : t('gamification.badges.pin', 'Épingler au profil')}
          </Button>
        </Flexbox>
      }
      onCancel={onCancel}
      open={open}
      title={t('gamification.badges.detailsTitle', 'Détails du Badge')}
      width={400}
    >
      <div className={styles.modalBody}>
        <PremiumCardWrapper rarity={badge.rarity} active={isUnlocked}>
          <div className={cx(styles.emojiContainer, !isUnlocked && styles.locked)}>
            {badge.emoji}
          </div>
        </PremiumCardWrapper>

        <div className={styles.infoSection}>
          <Title level={3} style={{ margin: '0 0 8px 0' }}>{badge.name}</Title>
          <div className={styles.rarityTag} style={{ marginBottom: 16, display: 'inline-block' }}>
            {badge.rarity}
          </div>
          
          <Paragraph type="secondary" style={{ fontStyle: 'italic', marginBottom: 16 }}>
            "{badge.lore}"
          </Paragraph>

          <Flexbox align="center" gap={8} style={{ background: 'var(--color-fill-quaternary)', padding: 12, borderRadius: 8 }}>
            <Text strong>{t('gamification.badges.condition', "Condition d'obtention :")}</Text>
            <Text>{badge.description}</Text>
          </Flexbox>

          {!isUnlocked && badge.requirements && (
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <Flexbox justify="space-between" align="center" style={{ marginBottom: 8 }}>
                <Text strong>{t('gamification.badges.progress', 'Progression')}</Text>
                <Text type="secondary">{useGamificationStore.getState().actionCounts[badge.requirements.action] || 0} / {badge.requirements.target}</Text>
              </Flexbox>
              <Progress 
                percent={Math.min(100, Math.floor(((useGamificationStore.getState().actionCounts[badge.requirements.action] || 0) / badge.requirements.target) * 100))} 
                status="active" 
                showInfo={false} 
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
