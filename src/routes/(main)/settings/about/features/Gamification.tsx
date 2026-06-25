import { Badge, Card, Col, Progress, Row, Typography, Tooltip, Skeleton, Tag } from 'antd';
import { useTheme } from 'antd-style';
import { Trophy, Star, Target, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';
import { Flexbox } from '@lobehub/ui';

import { BADGES_CATALOG, QUESTS_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';

const { Title, Text } = Typography;

const Gamification = () => {
  const theme = useTheme();
  // We use French directly as requested ("Parler en français", "Mettre dans la page des paramètres")
  const {
    totalXp,
    currentLevel,
    activeQuests,
    unlockedBadgeIds,
    loading,
    refreshProgression,
    refreshQuests,
    refreshBadges,
    claimQuest,
  } = useGamificationStore();

  useEffect(() => {
    refreshProgression();
    refreshQuests();
    refreshBadges();
  }, []);

  const XP_PER_LEVEL = 100; // As defined in utils
  const nextLevelXp = currentLevel * XP_PER_LEVEL;
  const currentLevelXp = (currentLevel - 1) * XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round(((totalXp - currentLevelXp) / XP_PER_LEVEL) * 100));

  if (loading && totalXp === 0) {
    return <Skeleton active />;
  }

  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaim = async (id: string) => {
    await claimQuest(id);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <Card bordered={false} style={{ marginTop: 24, background: theme.colorFillQuaternary, borderRadius: 12 }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }} />}
      <Flexbox gap={24}>
        <Flexbox horizontal align="center" gap={8}>
          <Title level={4} style={{ margin: 0 }}>Récompenses</Title>
          <Tag color="blue" bordered={false}>Bêta</Tag>
        </Flexbox>
        {/* En-tête : Niveau et XP */}
        <Flexbox align={'center'} gap={16} horizontal justify={'space-between'}>
          <Flexbox align={'center'} gap={12} horizontal>
            <div style={{ padding: 12, background: theme.colorPrimaryBg, borderRadius: '50%' }}>
              <Trophy size={24} color={theme.colorPrimary} />
            </div>
            <Flexbox>
              <Title level={4} style={{ margin: 0 }}>Niveau {currentLevel} 🚀</Title>
              <Text type={'secondary'}>{totalXp} XP Total ✨</Text>
            </Flexbox>
          </Flexbox>
          <Flexbox style={{ width: 200 }}>
            <Flexbox horizontal justify={'space-between'} style={{ marginBottom: 4 }}>
              <Text type={'secondary'} style={{ fontSize: 12 }}>XP vers Nv {currentLevel + 1}</Text>
              <Text strong style={{ fontSize: 12 }}>{totalXp - currentLevelXp} / {XP_PER_LEVEL}</Text>
            </Flexbox>
            <Progress percent={progressPercent} strokeColor={theme.colorPrimary} showInfo={false} />
          </Flexbox>
        </Flexbox>

        <Row gutter={[16, 16]}>
          {/* Quêtes Actives */}
          <Col span={24} md={12}>
            <Card title={<><Target size={18} style={{ marginRight: 8, verticalAlign: 'middle' }}/> Quêtes en cours 🎯</>} size="small" style={{ height: '100%' }}>
              {activeQuests.length === 0 ? (
                <Text type="secondary">Aucune quête active pour le moment. Revenez plus tard !</Text>
              ) : (
                <Flexbox gap={12}>
                  {activeQuests.map(q => {
                    const catalogQuest = QUESTS_CATALOG.find(cat => cat.id === q.questId);
                    if (!catalogQuest) return null;
                    
                    const isCompleted = q.status === 'completed';
                    const isClaimed = q.status === 'claimed';
                    
                    if (catalogQuest.isHidden && !isCompleted && !isClaimed) {
                      return null;
                    }

                    const percent = Math.min(100, Math.round((q.progress / catalogQuest.objectiveCount) * 100));

                    return (
                      <Flexbox key={q.id} style={{ padding: 8, background: theme.colorFillQuaternary, borderRadius: 8 }}>
                        <Flexbox horizontal justify="space-between" align="center" style={{ marginBottom: 4 }}>
                          <Text strong style={{ textDecoration: isClaimed ? 'line-through' : 'none' }}>
                            {catalogQuest.title}
                          </Text>
                          <Badge 
                            count={`+${catalogQuest.xpReward} XP`} 
                            style={{ backgroundColor: isClaimed ? theme.colorSuccessBg : theme.colorPrimaryBg, color: isClaimed ? theme.colorSuccess : theme.colorPrimary, boxShadow: 'none' }} 
                          />
                        </Flexbox>
                        <Text type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>{catalogQuest.description}</Text>
                        
                        {!isClaimed ? (
                          <Flexbox horizontal gap={12} align="center">
                            <Progress percent={percent} size="small" style={{ flex: 1, margin: 0 }} strokeColor={isCompleted ? theme.colorSuccess : theme.colorPrimary} />
                            {isCompleted && (
                              <a onClick={() => handleClaim(q.id)} style={{ fontSize: 12, whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                Réclamer 🎉
                              </a>
                            )}
                          </Flexbox>
                        ) : (
                          <Flexbox horizontal align="center" gap={4}>
                            <CheckCircle2 size={14} color={theme.colorSuccess} />
                            <Text type="success" style={{ fontSize: 12 }}>Complétée</Text>
                          </Flexbox>
                        )}
                      </Flexbox>
                    );
                  })}
                </Flexbox>
              )}
            </Card>
          </Col>

          {/* Badges Débloqués */}
          <Col span={24} md={12}>
            <Card title={<><Star size={18} style={{ marginRight: 8, verticalAlign: 'middle' }}/> Badges Débloqués 🏅</>} size="small" style={{ height: '100%' }}>
              <Row gutter={[12, 12]}>
                {BADGES_CATALOG.map(badge => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <Col span={8} key={badge.id}>
                      <Tooltip title={`${badge.title} : ${badge.description}`}>
                        <Flexbox align="center" justify="center" style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          background: isUnlocked ? theme.colorPrimaryBg : theme.colorFillQuaternary,
                          opacity: isUnlocked ? 1 : 0.5,
                          border: `1px solid ${isUnlocked ? theme.colorPrimaryBorder : 'transparent'}`,
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>
                            {badge.icon || '🏆'}
                          </div>
                          <Text style={{ fontSize: 11, lineHeight: 1.2, fontWeight: isUnlocked ? 600 : 400 }}>
                            {badge.title}
                          </Text>
                        </Flexbox>
                      </Tooltip>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
      </Flexbox>
    </Card>
  );
};

export default Gamification;
