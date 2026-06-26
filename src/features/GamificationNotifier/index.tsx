import { useEffect, useRef, useState } from 'react';
import { message, notification, Modal, Typography } from 'antd';
import Confetti from 'react-confetti';
import { lambdaClient } from '@/libs/trpc/client';
import { BADGES_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';
import { playGamificationSound } from '@/utils/gamificationSound';

export const GamificationNotifier = () => {
  const { settings } = useGamificationStore();

  const { data: progression } = lambdaClient.gamification.getProgression.useQuery(undefined, {
    refetchInterval: 15000,
    enabled: settings.enableGamification,
  });

  const { data: badges } = lambdaClient.gamification.getBadges.useQuery(undefined, {
    refetchInterval: 15000,
    enabled: settings.enableGamification,
  });

  const prevLevelRef = useRef<number | null>(null);
  const prevBadgesRef = useRef<string[] | null>(null);
  const [spectacularLevel, setSpectacularLevel] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!settings.enableGamification || !progression) return;

    if (prevLevelRef.current !== null && progression.currentLevel > prevLevelRef.current) {
      // Level Up!
      const newLevel = progression.currentLevel;
      if (newLevel % 10 === 0) {
        if (settings.enableSoundEffects) {
          playGamificationSound('levelUp', settings.soundVolume);
        }
        if (settings.enableConfetti || settings.enableToasts) {
          setSpectacularLevel(newLevel);
        }
      } else {
        if (settings.enableSoundEffects) {
          playGamificationSound('levelUp', settings.soundVolume);
        }
        if (settings.enableToasts) {
          message.success(`🎉 Félicitations ! Vous avez atteint le niveau ${newLevel} !`);
        }
      }
    }

    prevLevelRef.current = progression.currentLevel;
  }, [progression?.currentLevel, settings.enableGamification]);

  useEffect(() => {
    if (!settings.enableGamification || !badges) return;

    if (prevBadgesRef.current !== null) {
      const newBadges = badges.unlockedIds.filter(id => !prevBadgesRef.current!.includes(id));
      
      if (newBadges.length > 0) {
        newBadges.forEach(badgeId => {
          const catalogBadge = BADGES_CATALOG.find(b => b.id === badgeId);
          if (catalogBadge) {
            if (settings.enableSoundEffects) {
              const soundType = (catalogBadge.rarity === 'mythic' || catalogBadge.rarity === 'ultra')
                ? 'arpeggio'
                : 'chime';
              playGamificationSound(soundType, settings.soundVolume);
            }
            if (settings.enableToasts) {
              notification.success({
                message: 'Nouveau Badge Débloqué ! 🏆',
                description: `Vous avez obtenu le badge : ${catalogBadge.title} ${catalogBadge.icon}`,
                placement: 'topRight',
              });
            }
          }
        });

        // Déclencher les confettis festifs
        if (settings.enableConfetti) {
          setShowConfetti(false);
          setTimeout(() => {
            setShowConfetti(true);
          }, 50);
          if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
          confettiTimeoutRef.current = setTimeout(() => {
            setShowConfetti(false);
          }, 8000);
        }
      }
    }

    prevBadgesRef.current = badges.unlockedIds;
  }, [badges?.unlockedIds, settings.enableGamification]);

  if (!settings.enableGamification) return null;

  return (
    <>
      {showConfetti && settings.enableConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          gravity={0.15}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 10000, top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}
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
            {settings.enableConfetti && (
              <Confetti recycle={false} numberOfPieces={500} gravity={0.2} />
            )}
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
