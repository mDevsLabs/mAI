'use client';

import { Card, Col, Row, Typography, Tooltip, Skeleton, Empty, Tag } from 'antd';
import { useTheme } from 'antd-style';
import { Star, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { Flexbox } from '@lobehub/ui';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { BADGES_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';

const { Text } = Typography;

const BadgesPage = () => {
  const theme = useTheme();
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
        <SettingHeader title="Badges 🎖️" />
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

  return (
    <>
      <SettingHeader title="Badges 🎖️" />
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
                        style={{
                          padding: '24px 12px',
                          borderRadius: 12,
                          background: isUnlocked ? theme.colorPrimaryBg : theme.colorFillQuaternary,
                          border: `2px solid ${isUnlocked ? rarityColor : 'transparent'}`,
                          boxShadow: isUnlocked ? `0 0 12px ${rarityColor}33` : 'none',
                          transition: 'all 0.3s ease',
                          textAlign: 'center',
                          height: '100%',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
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
                          {badge.icon || '🏆'}
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
