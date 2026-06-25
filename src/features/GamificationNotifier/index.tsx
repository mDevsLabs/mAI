import { useEffect, useRef, useState } from 'react';
import { message, notification, Modal, Typography } from 'antd';
import Confetti from 'react-confetti';
import { lambdaClient } from '@/libs/trpc/client';
import { BADGES_CATALOG } from '@lobechat/const/src/gamification';

export const GamificationNotifier = () => {
  const { data: progression } = lambdaClient.gamification.getProgression.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const { data: badges } = lambdaClient.gamification.getBadges.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const prevLevelRef = useRef<number | null>(null);
  const prevBadgesRef = useRef<string[] | null>(null);
  const [spectacularLevel, setSpectacularLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!progression) return;

    if (prevLevelRef.current !== null && progression.currentLevel > prevLevelRef.current) {
      // Level Up!
      const newLevel = progression.currentLevel;
      if (newLevel % 10 === 0) {
        setSpectacularLevel(newLevel);
      } else {
        message.success(`🎉 Félicitations ! Vous avez atteint le niveau ${newLevel} !`);
      }
    }

    prevLevelRef.current = progression.currentLevel;
  }, [progression?.currentLevel]);

  useEffect(() => {
    if (!badges) return;

    if (prevBadgesRef.current !== null) {
      const newBadges = badges.unlockedIds.filter(id => !prevBadgesRef.current!.includes(id));
      
      newBadges.forEach(badgeId => {
        const catalogBadge = BADGES_CATALOG.find(b => b.id === badgeId);
        if (catalogBadge) {
          notification.success({
            message: 'Nouveau Badge Débloqué ! 🏆',
            description: `Vous avez obtenu le badge : ${catalogBadge.title} ${catalogBadge.icon}`,
            placement: 'topRight',
          });
        }
      });
    }

    prevBadgesRef.current = badges.unlockedIds;
  }, [badges?.unlockedIds]);

  return (
    <>
      <Modal
        open={spectacularLevel !== null}
        onCancel={() => setSpectacularLevel(null)}
        footer={null}
        centered
        width={400}
        styles={{
          body: { textAlign: 'center', padding: '40px 20px' },
          content: { borderRadius: 16, overflow: 'hidden' }
        }}
      >
        {spectacularLevel !== null && (
          <>
            <Confetti recycle={false} numberOfPieces={500} gravity={0.2} />
            <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: 16 }}>🌟</div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              NIVEAU {spectacularLevel} !
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: '16px' }}>
              Incroyable ! Vous venez de franchir un palier majeur de progression.
            </Typography.Paragraph>
          </>
        )}
      </Modal>
    </>
  );
};
