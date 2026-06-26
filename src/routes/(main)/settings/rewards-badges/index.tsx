'use client';

import { Card, Col, Row, Typography, Tooltip, Skeleton, Empty, Tag } from 'antd';
import { useTheme, createStyles, keyframes } from 'antd-style';
import { Star, Lock, Trophy, MessageSquare, Cpu, Award, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Flexbox } from '@lobehub/ui';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { BADGES_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';

const { Text } = Typography;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulseMythic = keyframes`
  0% {
    box-shadow: 0 0 8px rgba(233, 30, 99, 0.4);
    border-color: rgba(233, 30, 99, 0.6);
  }
  50% {
    box-shadow: 0 0 24px rgba(233, 30, 99, 0.9);
    border-color: rgba(233, 30, 99, 1);
  }
  100% {
    box-shadow: 0 0 8px rgba(233, 30, 99, 0.4);
    border-color: rgba(233, 30, 99, 0.6);
  }
`;

const pulseUltra = keyframes`
  0% {
    box-shadow: 0 0 8px rgba(0, 230, 118, 0.4);
    border-color: rgba(0, 230, 118, 0.6);
  }
  50% {
    box-shadow: 0 0 24px rgba(0, 230, 118, 0.9);
    border-color: rgba(0, 230, 118, 1);
  }
  100% {
    box-shadow: 0 0 8px rgba(0, 230, 118, 0.4);
    border-color: rgba(0, 230, 118, 0.6);
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 0.8;
  }
`;

const useStyles = createStyles(({ css }) => ({
  mythicBadge: css`
    position: relative;
    overflow: hidden;
    animation: ${pulseMythic} 3s infinite ease-in-out;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 200% 100%;
      animation: ${shimmer} 3s infinite linear;
      pointer-events: none;
    }
  `,
  ultraBadge: css`
    position: relative;
    overflow: hidden;
    animation: ${pulseUltra} 3s infinite ease-in-out;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 200% 100%;
      animation: ${shimmer} 2.5s infinite linear;
      pointer-events: none;
    }
  `,
  sparkle: css`
    position: absolute;
    pointer-events: none;
    animation: ${sparkleAnimation} 2s infinite ease-in-out;
  `,
}));

const BadgesPage = () => {
  const theme = useTheme();
  const { styles } = useStyles();
  const {
    unlockedBadgeIds,
    loading,
    refreshBadges,
    settings,
  } = useGamificationStore();

  useEffect(() => {
    refreshBadges();
  }, []);

  if (!settings.enableGamification) {
    return (
      <>
        <SettingHeader title={
          <Flexbox horizontal align="center" gap={8}>
            <Star size={24} color={theme.colorPrimary} />
            <span>Badges</span>
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      case 'mythic':
        return '#e91e63';
      case 'ultra':
        return '#00e676';
      default:
        return theme.colorTextSecondary;
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Épique';
      case 'legendary':
        return 'Légendaire';
      case 'mythic':
        return 'Mythique';
      case 'ultra':
        return 'Ultra';
      default:
        return 'Commun';
    }
  };

  const getBadgeIcon = (badgeId: string, color: string) => {
    const size = 36;
    if (badgeId.startsWith('badge_messages_')) {
      return <MessageSquare size={size} color={color} />;
    }
    if (badgeId.startsWith('badge_agents_')) {
      return <Cpu size={size} color={color} />;
    }
    if (badgeId.startsWith('badge_level_')) {
      return <Trophy size={size} color={color} />;
    }
    return <Award size={size} color={color} />;
  };

  return (
    <>
      <SettingHeader title={
        <Flexbox horizontal align="center" gap={8}>
          <Star size={24} color={theme.colorPrimary} />
          <span>Badges</span>
        </Flexbox>
      } />
      <Flexbox gap={24} style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          {loading && unlockedBadgeIds.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Row gutter={[16, 16]}>
              {BADGES_CATALOG.map(badge => {
                const isUnlocked = unlockedBadgeIds.includes(badge.id);
                const rarityColor = getRarityColor(badge.rarity);
                const rarityLabel = getRarityLabel(badge.rarity);

                return (
                  <Col span={12} sm={8} md={6} lg={4} key={badge.id}>
                    <Tooltip title={
                      <Flexbox gap={4} style={{ padding: 4 }}>
                        <Text strong style={{ color: '#fff' }}>{badge.title}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{badge.description}</Text>
                        <Flexbox horizontal gap={6} align="center" style={{ marginTop: 4 }}>
                          <Tag color={rarityColor} style={{ border: 'none', margin: 0, fontWeight: 'bold' }}>{rarityLabel}</Tag>
                          <Text style={{ color: '#ffb300', fontSize: 11, fontWeight: 'bold' }}>+{badge.xpReward} XP</Text>
                        </Flexbox>
                      </Flexbox>
                    }>
                      <Flexbox
                        align="center"
                        justify="center"
                        className={
                          badge.rarity === 'mythic' && isUnlocked
                            ? styles.mythicBadge
                            : badge.rarity === 'ultra' && isUnlocked
                            ? styles.ultraBadge
                            : undefined
                        }
                        style={{
                          padding: '24px 12px',
                          borderRadius: 12,
                          background: isUnlocked ? theme.colorPrimaryBg : theme.colorFillQuaternary,
                          border: `2px solid ${isUnlocked ? rarityColor : 'transparent'}`,
                          boxShadow: isUnlocked && badge.rarity !== 'mythic' && badge.rarity !== 'ultra' ? `0 0 12px ${rarityColor}33` : 'none',
                          transition: 'all 0.3s ease',
                          textAlign: 'center',
                          height: '100%',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        {isUnlocked && (badge.rarity === 'mythic' || badge.rarity === 'ultra') && (
                          <>
                            <Sparkles
                              className={styles.sparkle}
                              size={12}
                              color={rarityColor}
                              style={{ top: '10%', left: '10%', animationDelay: '0s' }}
                            />
                            <Sparkles
                              className={styles.sparkle}
                              size={8}
                              color={rarityColor}
                              style={{ top: '25%', right: '12%', animationDelay: '0.5s' }}
                            />
                            <Sparkles
                              className={styles.sparkle}
                              size={10}
                              color={rarityColor}
                              style={{ bottom: '15%', left: '15%', animationDelay: '1s' }}
                            />
                            <Sparkles
                              className={styles.sparkle}
                              size={6}
                              color={rarityColor}
                              style={{ bottom: '8%', right: '18%', animationDelay: '1.5s' }}
                            />
                          </>
                        )}
                        {!isUnlocked && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            opacity: 0.7
                          }}>
                            <Lock size={12} color={theme.colorTextPlaceholder} />
                          </div>
                        )}
                        <div style={{
                          fontSize: 36,
                          marginBottom: 8,
                          filter: isUnlocked ? 'none' : 'grayscale(1) contrast(0.5)',
                          opacity: isUnlocked ? 1 : 0.4,
                          transform: isUnlocked ? 'scale(1)' : 'scale(0.95)',
                          transition: 'all 0.3s ease'
                        }}>
                          {getBadgeIcon(badge.id, isUnlocked ? rarityColor : theme.colorTextPlaceholder)}
                        </div>
                        <Text strong style={{
                          fontSize: 13,
                          lineHeight: 1.2,
                          color: isUnlocked ? theme.colorText : theme.colorTextPlaceholder,
                        }}>
                          {badge.title}
                        </Text>
                        {isUnlocked ? (
                          <Text style={{ fontSize: 10, color: rarityColor, marginTop: 4, fontWeight: 'bold' }}>
                            {rarityLabel}
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 10, color: theme.colorTextPlaceholder, marginTop: 4 }}>
                            Verrouillé
                          </Text>
                        )}
                      </Flexbox>
                    </Tooltip>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>
      </Flexbox>
    </>
  );
};

export default BadgesPage;
