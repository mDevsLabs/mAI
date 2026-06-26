'use client';

import { Card, Col, Row, Typography, Tooltip, Skeleton, Empty, Tag, Input, Select, Segmented, Button, Modal } from 'antd';
import { useTheme, createStyles, keyframes } from 'antd-style';
import { Star, Lock, Sparkles, Pin, PinOff, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Flexbox } from '@lobehub/ui';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { BADGES_CATALOG } from '@lobechat/const';
import { useGamificationStore } from '@/store/gamification';

const { Text, Title, Paragraph } = Typography;

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
    box-shadow: 0 0 20px rgba(233, 30, 99, 0.8), 0 0 30px rgba(233, 30, 99, 0.4);
    border-color: rgba(233, 30, 99, 1);
  }
  100% {
    box-shadow: 0 0 8px rgba(233, 30, 99, 0.4);
    border-color: rgba(233, 30, 99, 0.6);
  }
`;

const pulseUltra = keyframes`
  0% {
    box-shadow: 0 0 8px rgba(0, 230, 118, 0.3), 0 0 12px rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 230, 118, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 230, 118, 0.6), 0 0 30px rgba(0, 229, 255, 0.6), 0 0 40px rgba(255, 0, 128, 0.4);
    border-color: rgba(0, 229, 255, 1);
  }
  100% {
    box-shadow: 0 0 8px rgba(0, 230, 118, 0.3), 0 0 12px rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 230, 118, 0.6);
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.9;
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
        rgba(255, 0, 128, 0) 0%,
        rgba(0, 229, 255, 0.25) 30%,
        rgba(0, 230, 118, 0.25) 50%,
        rgba(255, 235, 59, 0.25) 70%,
        rgba(255, 0, 128, 0) 100%
      );
      background-size: 200% 100%;
      animation: ${shimmer} 2.5s infinite linear;
      pointer-events: none;
    }
  `,
  sparkle: css`
    position: absolute;
    pointer-events: none;
    animation: ${sparkleAnimation} 2.5s infinite ease-in-out;
  `,
  pinButton: css`
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 5;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    &:hover {
      transform: scale(1.2);
    }
  `,
  badgeCard: css`
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    height: 100%;
    &:hover {
      transform: translateY(-4px);
      .pin-btn-hover {
        opacity: 0.8;
      }
    }
  `
}));

const BadgesPage = () => {
  const theme = useTheme();
  const { styles } = useStyles();
  const {
    unlockedBadgeIds,
    loading,
    refreshBadges,
    settings,
    updateSettings,
  } = useGamificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked' | 'recent' | 'pinned'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'rarityAsc' | 'rarityDesc' | 'xpAsc' | 'xpDesc'>('default');
  const [columnsCount, setColumnsCount] = useState<3 | 4 | 6>(4);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

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

  const getRarityValue = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      case 'mythic': return 5;
      case 'ultra': return 6;
      default: return 1;
    }
  };

  const handleTogglePin = (badgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = settings.pinnedBadgeIds ?? [];
    const next = current.includes(badgeId)
      ? current.filter(id => id !== badgeId)
      : [...current, badgeId];
    updateSettings({ pinnedBadgeIds: next });
  };

  const handleClearAllPins = () => {
    updateSettings({ pinnedBadgeIds: [] });
  };

  // Filtrage et tri
  const filteredBadges = BADGES_CATALOG.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isUnlocked = unlockedBadgeIds.includes(badge.id);
    const isPinned = settings.pinnedBadgeIds?.includes(badge.id);

    if (filterMode === 'unlocked') return isUnlocked;
    if (filterMode === 'locked') return !isUnlocked;
    if (filterMode === 'pinned') return isPinned;

    return true;
  });

  let displayBadges = [...filteredBadges];

  if (filterMode === 'recent') {
    displayBadges = displayBadges
      .filter(badge => unlockedBadgeIds.includes(badge.id))
      .sort((a, b) => {
        const indexA = unlockedBadgeIds.indexOf(a.id);
        const indexB = unlockedBadgeIds.indexOf(b.id);
        return indexB - indexA;
      });
  } else {
    // Appliquer le tri selon sortBy
    displayBadges.sort((a, b) => {
      if (sortBy === 'rarityAsc') return getRarityValue(a.rarity) - getRarityValue(b.rarity);
      if (sortBy === 'rarityDesc') return getRarityValue(b.rarity) - getRarityValue(a.rarity);
      if (sortBy === 'xpAsc') return a.xpReward - b.xpReward;
      if (sortBy === 'xpDesc') return b.xpReward - a.xpReward;
      return 0;
    });

    // Par défaut, mettre les badges épinglés au tout début du catalogue
    displayBadges.sort((a, b) => {
      const pinA = settings.pinnedBadgeIds?.includes(a.id) ? 1 : 0;
      const pinB = settings.pinnedBadgeIds?.includes(b.id) ? 1 : 0;
      return pinB - pinA;
    });
  }

  // Calcul du span de la grille Ant Design en fonction du nombre de colonnes choisi
  const getColSpan = () => {
    switch (columnsCount) {
      case 3:
        return { span: 24, sm: 12, md: 8 };
      case 6:
        return { span: 12, sm: 8, md: 6, lg: 4 };
      case 4:
      default:
        return { span: 12, sm: 8, md: 6 };
    }
  };

  const hasPins = (settings.pinnedBadgeIds ?? []).length > 0;

  return (
    <>
      <SettingHeader title={
        <Flexbox horizontal align="center" gap={8}>
          <Star size={24} color={theme.colorPrimary} />
          <span>Badges</span>
        </Flexbox>
      } />
      
      <Flexbox gap={20} style={{ width: '100%' }}>
        {/* Barre de contrôle */}
        <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
          <Flexbox horizontal gap={16} align="center" justify="space-between" wrap="wrap">
            <Flexbox horizontal gap={12} align="center" style={{ flex: 1, minWidth: 280 }}>
              <Input
                placeholder="Rechercher un badge..."
                prefix={<Search size={16} color={theme.colorTextPlaceholder} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ maxWidth: 220 }}
              />
              <Select
                value={filterMode}
                onChange={(val) => setFilterMode(val)}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: 'Tous les badges' },
                  { value: 'unlocked', label: 'Débloqués' },
                  { value: 'locked', label: 'Verrouillés' },
                  { value: 'recent', label: 'Derniers débloqués' },
                  { value: 'pinned', label: 'Épinglés' },
                ]}
              />
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                style={{ width: 160 }}
                options={[
                  { value: 'default', label: 'Tri par défaut' },
                  { value: 'rarityAsc', label: 'Rareté (croissante)' },
                  { value: 'rarityDesc', label: 'Rareté (décroissante)' },
                  { value: 'xpAsc', label: 'XP (croissant)' },
                  { value: 'xpDesc', label: 'XP (décroissant)' },
                ]}
              />
            </Flexbox>
            <Flexbox horizontal gap={12} align="center">
              <Segmented
                value={columnsCount}
                onChange={(val) => setColumnsCount(val as 3 | 4 | 6)}
                options={[
                  { label: '3 Col', value: 3 },
                  { label: '4 Col', value: 4 },
                  { label: '6 Col', value: 6 },
                ]}
              />
              {hasPins && (
                <Button
                  danger
                  type="text"
                  icon={<Trash2 size={14} />}
                  onClick={handleClearAllPins}
                >
                  Tout désépingler
                </Button>
              )}
            </Flexbox>
          </Flexbox>
        </Card>

        {/* Grille des badges */}
        <Card bordered={false} style={{ borderRadius: 12 }}>
          {loading && unlockedBadgeIds.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : displayBadges.length === 0 ? (
            <Empty description="Aucun badge ne correspond aux critères." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Row gutter={[16, 16]}>
              {displayBadges.map(badge => {
                const isUnlocked = unlockedBadgeIds.includes(badge.id);
                const isPinned = settings.pinnedBadgeIds?.includes(badge.id);
                const rarityColor = getRarityColor(badge.rarity);
                const rarityLabel = getRarityLabel(badge.rarity);

                return (
                  <Col {...getColSpan()} key={badge.id}>
                    <Tooltip title={
                      <Flexbox gap={4} style={{ padding: 4 }}>
                        <span style={{ fontWeight: 'bold' }}>{badge.title}</span>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>{badge.description}</span>
                        <Flexbox horizontal gap={6} align="center" style={{ marginTop: 4 }}>
                          <Tag color={rarityColor} style={{ border: 'none', margin: 0, fontWeight: 'bold' }}>{rarityLabel}</Tag>
                          <span style={{ color: '#ffb300', fontSize: 11, fontWeight: 'bold' }}>+{badge.xpReward} XP</span>
                        </Flexbox>
                      </Flexbox>
                    }>
                      <Flexbox
                        align="center"
                        justify="center"
                        onClick={() => setSelectedBadge(badge)}
                        className={`${styles.badgeCard} ${
                          badge.rarity === 'mythic' && isUnlocked && (settings.showBadgeAnimations ?? true)
                            ? styles.mythicBadge
                            : badge.rarity === 'ultra' && isUnlocked && (settings.showBadgeAnimations ?? true)
                            ? styles.ultraBadge
                            : ''
                        }`}
                        style={{
                          padding: '24px 12px',
                          borderRadius: 12,
                          background: isUnlocked ? theme.colorPrimaryBg : theme.colorFillQuaternary,
                          border: `2px solid ${isUnlocked ? rarityColor : 'transparent'}`,
                          boxShadow: isUnlocked && badge.rarity !== 'mythic' && badge.rarity !== 'ultra' ? `0 0 12px ${rarityColor}33` : 'none',
                          transition: 'all 0.3s ease',
                          textAlign: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Bouton d'épinglage pour tous les badges */}
                        <button
                          className={`${styles.pinButton} ${isPinned ? '' : 'pin-btn-hover'}`}
                          onClick={(e) => handleTogglePin(badge.id, e)}
                          style={{
                            opacity: isPinned ? 0.9 : undefined,
                          }}
                        >
                          {isPinned ? (
                            <Pin size={14} fill={theme.colorPrimary} color={theme.colorPrimary} />
                          ) : (
                            <PinOff size={14} color={theme.colorTextPlaceholder} />
                          )}
                        </button>

                        {/* Particules pour Mythic et Ultra */}
                        {isUnlocked && (badge.rarity === 'mythic' || badge.rarity === 'ultra') && (settings.showBadgeAnimations ?? true) && (
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

                        {/* Indicateur verrouillé */}
                        {!isUnlocked && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: isPinned ? 28 : 8,
                            opacity: 0.7,
                            transition: 'right 0.2s ease',
                          }}>
                            <Lock size={12} color={theme.colorTextPlaceholder} />
                          </div>
                        )}

                        {/* Emoji du badge */}
                        <div style={{
                          fontSize: 36,
                          marginBottom: 8,
                          filter: isUnlocked ? 'none' : 'grayscale(1) contrast(0.5)',
                          opacity: isUnlocked ? 1 : 0.4,
                          transform: isUnlocked ? 'scale(1)' : 'scale(0.95)',
                          transition: 'all 0.3s ease',
                          lineHeight: 1,
                        }}>
                          {badge.icon}
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

      {/* Modal de Détails du Badge */}
      <Modal
        open={selectedBadge !== null}
        onCancel={() => setSelectedBadge(null)}
        footer={null}
        centered
        width={400}
        styles={{
          body: { textAlign: 'center', padding: '32px 24px' },
          content: { borderRadius: 16 }
        }}
      >
        {selectedBadge && (() => {
          const isUnlocked = unlockedBadgeIds.includes(selectedBadge.id);
          const rarityColor = getRarityColor(selectedBadge.rarity);
          const rarityLabel = getRarityLabel(selectedBadge.rarity);

          return (
            <Flexbox align="center" gap={16}>
              {/* Grand Emoji Animé si débloqué et premium */}
              <div style={{
                position: 'relative',
                display: 'inline-block',
                fontSize: 64,
                lineHeight: 1,
                marginBottom: 8,
                filter: isUnlocked ? 'none' : 'grayscale(1) contrast(0.5)',
                opacity: isUnlocked ? 1 : 0.5,
              }}>
                {selectedBadge.icon}
                {isUnlocked && (selectedBadge.rarity === 'mythic' || selectedBadge.rarity === 'ultra') && (settings.showBadgeAnimations ?? true) && (
                  <>
                    <Sparkles
                      className={styles.sparkle}
                      size={16}
                      color={rarityColor}
                      style={{ top: '-10%', left: '-10%', animationDelay: '0.2s' }}
                    />
                    <Sparkles
                      className={styles.sparkle}
                      size={12}
                      color={rarityColor}
                      style={{ bottom: '-10%', right: '-10%', animationDelay: '0.7s' }}
                    />
                  </>
                )}
              </div>

              <Title level={3} style={{ margin: 0 }}>
                {selectedBadge.title}
              </Title>

              <Tag color={rarityColor} style={{ border: 'none', fontWeight: 'bold', fontSize: 12, padding: '2px 8px' }}>
                {rarityLabel}
              </Tag>

              <Flexbox gap={12} style={{ width: '100%', textAlign: 'left', marginTop: 12 }}>
                {/* Lore / Histoire */}
                {selectedBadge.lore && (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Histoire :</Text>
                    <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 0 0', fontStyle: 'italic' }}>
                      "{selectedBadge.lore}"
                    </Paragraph>
                  </div>
                )}

                {/* Objectif */}
                <div>
                  <Text strong style={{ fontSize: 13 }}>Objectif :</Text>
                  <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 0 0' }}>
                    {selectedBadge.conditionDescription || selectedBadge.description}
                  </Paragraph>
                </div>

                {/* Récompense */}
                <div>
                  <Text strong style={{ fontSize: 13 }}>Récompense :</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="gold" style={{ margin: 0, fontWeight: 'bold' }}>
                      +{selectedBadge.xpReward} XP
                    </Tag>
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <Text strong style={{ fontSize: 13 }}>Statut :</Text>
                  <div style={{ marginTop: 4 }}>
                    {isUnlocked ? (
                      <Tag color="success" style={{ margin: 0, fontWeight: 'bold' }}>Débloqué</Tag>
                    ) : (
                      <Tag color="default" style={{ margin: 0 }} icon={<Lock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>
                        Verrouillé
                      </Tag>
                    )}
                  </div>
                </div>
              </Flexbox>

              <Button
                type="primary"
                onClick={() => setSelectedBadge(null)}
                style={{ width: '100%', marginTop: 16, borderRadius: 8 }}
              >
                Fermer
              </Button>
            </Flexbox>
          );
        })()}
      </Modal>
    </>
  );
};

export default BadgesPage;
