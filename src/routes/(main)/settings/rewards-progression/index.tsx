'use client';

import { Card, Progress, Timeline, Typography, Skeleton, Empty, Tag } from 'antd';
import { useTheme } from 'antd-style';
import { Trophy, Star, Target, MessageSquare, Cpu, Calendar, Sparkles, Footprints } from 'lucide-react';
import { useEffect } from 'react';
import { Flexbox } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useGamificationStore } from '@/store/gamification';

const { Title, Text } = Typography;

const ProgressionPage = () => {
  const theme = useTheme();
  const { t } = useTranslation('setting');
  const {
    totalXp,
    currentLevel,
    xpHistory,
    loading,
    refreshProgression,
    refreshXpHistory,
    settings,
  } = useGamificationStore();

  useEffect(() => {
    refreshProgression();
    refreshXpHistory();
  }, []);

  if (!settings.enableGamification) {
    return (
      <>
        <SettingHeader title="Progression ✨" />
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

  const XP_PER_LEVEL = 100;
  const currentLevelXp = (currentLevel - 1) * XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round(((totalXp - currentLevelXp) / XP_PER_LEVEL) * 100));

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'message_sent':
        return <MessageSquare size={16} color={theme.colorPrimary} />;
      case 'task_created':
        return <Calendar size={16} color={theme.colorWarning} />;
      case 'agent_created':
        return <Cpu size={16} color={theme.colorInfo} />;
      case 'quest':
        return <Target size={16} color={theme.colorSuccess} />;
      case 'badge':
        return <Trophy size={16} color="#d4af37" />;
      case 'bonus':
        return <Sparkles size={16} color="#9c27b0" />;
      case 'companion_action':
        return <Footprints size={16} color={theme.colorInfo} />;
      default:
        return <Star size={16} color={theme.colorTextSecondary} />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'message_sent':
        return theme.colorPrimary;
      case 'task_created':
        return theme.colorWarning;
      case 'agent_created':
        return theme.colorInfo;
      case 'quest':
        return theme.colorSuccess;
      case 'badge':
        return '#d4af37';
      case 'bonus':
        return '#9c27b0';
      default:
        return theme.colorTextSecondary;
    }
  };

  return (
    <>
      <SettingHeader title="Progression ✨" />
      <Flexbox gap={24} style={{ width: '100%' }}>
        {/* Résumé de progression */}
        <Card bordered={false} style={{ background: theme.colorFillQuaternary, borderRadius: 12 }}>
          <Flexbox horizontal align="center" justify="space-between" gap={24} style={{ flexWrap: 'wrap' }}>
            <Flexbox align="center" gap={16} horizontal>
              <div style={{
                padding: 16,
                background: `linear-gradient(135deg, ${theme.colorPrimaryBg} 0%, ${theme.colorPrimaryBgHover} 100%)`,
                borderRadius: '50%',
                boxShadow: `0 4px 12px ${theme.colorPrimaryBg}`
              }}>
                <Trophy size={36} color={theme.colorPrimary} />
              </div>
              <Flexbox>
                <Title level={3} style={{ margin: 0 }}>Niveau {currentLevel} 🚀</Title>
                <Text type="secondary" style={{ fontSize: 14 }}>{totalXp} XP cumulés au total ✨</Text>
              </Flexbox>
            </Flexbox>

            <Flexbox style={{ minWidth: 280, flex: 1 }}>
              <Flexbox horizontal justify="space-between" style={{ marginBottom: 8 }}>
                <Text strong>Progression vers le niveau {currentLevel + 1}</Text>
                <Text type="secondary">{totalXp - currentLevelXp} / {XP_PER_LEVEL} XP</Text>
              </Flexbox>
              <Progress
                percent={progressPercent}
                strokeColor={{
                  '0%': theme.colorPrimary,
                  '100%': theme.colorSuccess,
                }}
                height={12}
                status="active"
              />
            </Flexbox>
          </Flexbox>
        </Card>

        {/* Historique d'XP */}
        <Card title="Historique d'XP 📜" bordered={false} style={{ borderRadius: 12 }}>
          {loading && xpHistory.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : xpHistory.length === 0 ? (
            <Empty description="Aucune transaction d'XP enregistrée." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div style={{ padding: '8px 16px 0 16px', maxHeight: 400, overflowY: 'auto' }}>
              <Timeline mode="left">
                {xpHistory.map((tx: any) => (
                  <Timeline.Item
                    key={tx.id}
                    dot={getSourceIcon(tx.source)}
                    color={getSourceColor(tx.source)}
                  >
                    <Flexbox horizontal justify="space-between" align="flex-start" gap={12}>
                      <Flexbox>
                        <Text strong style={{ fontSize: 14 }}>{tx.title}</Text>
                        {tx.description && (
                          <Text type="secondary" style={{ fontSize: 12, marginTop: 2 }}>{tx.description}</Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 10, marginTop: 4 }}>
                          {new Date(tx.createdAt).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </Flexbox>
                      <Tag color={tx.xpAmount >= 100 ? 'purple' : tx.xpAmount >= 25 ? 'blue' : 'default'} style={{ fontWeight: 'bold' }}>
                        +{tx.xpAmount} XP
                      </Tag>
                    </Flexbox>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </Card>
      </Flexbox>
    </>
  );
};

export default ProgressionPage;
