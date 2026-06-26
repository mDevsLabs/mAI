'use client';

import { Badge, Card, Col, Progress, Row, Typography, Skeleton, Empty, Tag, Button } from 'antd';
import { useTheme, createStyles, keyframes } from 'antd-style';
import { Trophy, Star, Target, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Flexbox } from '@lobehub/ui';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { QUESTS_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';
import { playGamificationSound } from '@/utils/gamificationSound';

const { Title, Text } = Typography;

const explodeAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0) rotate(var(--rotate));
    opacity: 0;
  }
`;

const useStyles = createStyles(({ css }) => ({
  particle: css`
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
    z-index: 10;
    animation: ${explodeAnimation} 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
  `,
  buttonWrapper: css`
    position: relative;
    display: inline-block;
  `,
}));

const QuestsPage = () => {
  const theme = useTheme();
  const { styles } = useStyles();
  const {
    activeQuests,
    loading,
    refreshQuests,
    claimQuest,
    settings,
  } = useGamificationStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [questParticles, setQuestParticles] = useState<Record<string, { id: number; x: number; y: number; size: number; color: string; rotate: number }[]>>({});

  useEffect(() => {
    refreshQuests();
  }, []);

  const triggerStarsExplosion = (questId: string) => {
    const particleColors = [
      '#ffb300', // Gold
      '#e91e63', // Mythic Pink
      '#00e676', // Ultra Green
      '#2196f3', // Blue
      '#9c27b0', // Purple
    ];

    const particles: { id: number; x: number; y: number; size: number; color: string; rotate: number }[] = [];
    const count = 16;

    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count) + Math.random() * 15) * (Math.PI / 180);
      const distance = 30 + Math.random() * 40; // Distance projetée
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 6 + Math.random() * 8;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      const rotate = Math.random() * 360;

      particles.push({
        id: Math.random(),
        x,
        y,
        size,
        color,
        rotate,
      });
    }

    setQuestParticles(prev => ({ ...prev, [questId]: particles }));

    // Nettoyer après 850ms (fin de l'animation)
    setTimeout(() => {
      setQuestParticles(prev => {
        const next = { ...prev };
        delete next[questId];
        return next;
      });
    }, 850);
  };

  const handleClaim = async (id: string) => {
    if (settings.enableSoundEffects) {
      playGamificationSound('arpeggio');
    }
    triggerStarsExplosion(id);
    await claimQuest(id);
    if (settings.enableConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  if (!settings.enableGamification) {
    return (
      <>
        <SettingHeader title={
          <Flexbox horizontal align="center" gap={8}>
            <Target size={24} color={theme.colorPrimary} />
            <span>Quêtes</span>
          </Flexbox>
        } />
        <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <Empty
            description="Le système de gamification est actuellement désactivé."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Text type="secondary">
            Vous pouvez le réactiver à tout moment dans l'onglet de Configuration de vos Récompenses.
          </Text>
        </Card>
      </>
    );
  }

  // Séparer les quêtes actives par type
  const dailyQuests = activeQuests.filter(q => {
    const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
    return catalogQuest && catalogQuest.type === 'daily';
  });

  const weeklyQuests = activeQuests.filter(q => {
    const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
    return catalogQuest && catalogQuest.type === 'weekly';
  });

  const renderQuestCard = (q: any) => {
    const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
    if (!catalogQuest) return null;

    const isCompleted = q.status === 'completed';
    const isClaimed = q.status === 'claimed';

    // Masquer les quêtes cachées non accomplies
    if (catalogQuest.isHidden && !isCompleted && !isClaimed) {
      return null;
    }

    const percent = Math.min(100, Math.round((q.progress / catalogQuest.objectiveCount) * 100));

    return (
      <Flexbox
        key={q.id}
        style={{
          padding: 16,
          background: theme.colorFillQuaternary,
          borderRadius: 12,
          border: catalogQuest.isHidden ? `1px dashed ${theme.colorPurple}` : 'none',
          position: 'relative'
        }}
      >
        <Flexbox horizontal justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Flexbox horizontal align="center" gap={8}>
            <Text strong style={{ textDecoration: isClaimed ? 'line-through' : 'none', fontSize: 14 }}>
              {catalogQuest.title}
            </Text>
            {catalogQuest.isHidden && (
              <Tag color="purple" style={{ fontSize: 10 }}>Secret</Tag>
            )}
            {catalogQuest.isLegendary && (
              <Tag color="gold" style={{ fontSize: 10 }}>Légendaire</Tag>
            )}
          </Flexbox>
          <Badge
            count={`+${catalogQuest.xpReward} XP`}
            style={{
              backgroundColor: isClaimed ? theme.colorSuccessBg : theme.colorPrimaryBg,
              color: isClaimed ? theme.colorSuccess : theme.colorPrimary,
              boxShadow: 'none',
              fontWeight: 'bold'
            }}
          />
        </Flexbox>
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>{catalogQuest.description}</Text>

        {!isClaimed ? (
          <Flexbox horizontal gap={12} align="center">
            <Progress
              percent={percent}
              size="small"
              style={{ flex: 1, margin: 0 }}
              strokeColor={isCompleted ? theme.colorSuccess : theme.colorPrimary}
            />
            {isCompleted ? (
              <div className={styles.buttonWrapper}>
                {questParticles[q.id]?.map(p => (
                  <Star
                    key={p.id}
                    className={styles.particle}
                    size={p.size}
                    fill={p.color}
                    color={p.color}
                    style={
                      {
                        '--x': `${p.x}px`,
                        '--y': `${p.y}px`,
                        '--rotate': `${p.rotate}deg`,
                      } as React.CSSProperties
                    }
                  />
                ))}
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleClaim(q.id)}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colorSuccess} 0%, ${theme.colorSuccessHover} 100%)`,
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 'bold'
                  }}
                >
                  Réclamer
                </Button>
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                {q.progress} / {catalogQuest.objectiveCount}
              </Text>
            )}
          </Flexbox>
        ) : (
          <Flexbox horizontal align="center" gap={4}>
            <CheckCircle2 size={16} color={theme.colorSuccess} />
            <Text type="success" style={{ fontSize: 12, fontWeight: 500 }}>Quête complétée</Text>
          </Flexbox>
        )}
      </Flexbox>
    );
  };

  return (
    <>
      <SettingHeader title={
        <Flexbox horizontal align="center" gap={8}>
          <Target size={24} color={theme.colorPrimary} />
          <span>Quêtes</span>
        </Flexbox>
      } />
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}
      <Flexbox gap={24} style={{ width: '100%' }}>
        {loading && activeQuests.length === 0 ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : activeQuests.length === 0 ? (
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Empty description="Aucune quête active." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Quêtes Quotidiennes */}
            <Col span={24} lg={12}>
              <Card title={<><Target size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Quêtes Quotidiennes</>} bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                <Flexbox gap={12}>
                  {dailyQuests.map(q => renderQuestCard(q))}
                  {dailyQuests.length === 0 && (
                    <Text type="secondary">Aucune quête quotidienne.</Text>
                  )}
                </Flexbox>
              </Card>
            </Col>

            {/* Quêtes Hebdomadaires */}
            <Col span={24} lg={12}>
              <Card title={<><Trophy size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Quêtes Hebdomadaires</>} bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                <Flexbox gap={12}>
                  {weeklyQuests.map(q => renderQuestCard(q))}
                  {weeklyQuests.length === 0 && (
                    <Text type="secondary">Aucune quête hebdomadaire.</Text>
                  )}
                </Flexbox>
              </Card>
            </Col>
          </Row>
        )}
      </Flexbox>
    </>
  );
};

export default QuestsPage;
