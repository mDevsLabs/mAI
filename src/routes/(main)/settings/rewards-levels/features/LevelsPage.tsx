'use client';

import { Flexbox } from '@lobehub/ui';
import { Typography, Progress, Table, Input, Select, Tag, Empty, Card, Button } from 'antd';
import { createStaticStyles, useTheme } from 'antd-style';
import { Search, Trophy, CheckSquare, Award, Download, Lock, MessageSquare, Puzzle, Sparkles, CheckCircle2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { useGamificationStore } from '@/store/gamification';

const { Title, Text } = Typography;

export const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
    background: radial-gradient(circle at top, color-mix(in srgb, ${cssVar.colorPrimary} 12%, transparent) 0%, transparent 60%);
    min-height: 100%;
    animation: fadeIn 0.8s ease-out;

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  levelCircle: css`
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: ${cssVar.colorFillTertiary};
    box-shadow: 0 0 40px ${cssVar.colorPrimaryBorder};
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: pulseGlow 4s ease-in-out infinite;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 60px ${cssVar.colorPrimary};
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 30px ${cssVar.colorPrimaryBorder}; }
      50% { box-shadow: 0 0 50px ${cssVar.colorPrimary}; }
    }
  `,
  levelNumber: css`
    font-size: 96px;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, ${cssVar.colorPrimary}, ${cssVar.colorInfo});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  progressText: css`
    margin-top: 16px;
    font-size: 20px;
    color: ${cssVar.colorTextSecondary};
    font-weight: bold;
    letter-spacing: 0.5px;
  `,
  statsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 24px;
    width: 100%;
  `,
  statCard: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.05);
      border-color: ${cssVar.colorPrimary};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  `,
  rewardsSection: css`
    width: 100%;
    background: rgba(255, 255, 255, 0.01);
    backdrop-filter: blur(15px);
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 20px;
    padding: 24px;
  `,
  rewardsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    width: 100%;
  `,
  rewardCard: css`
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid ${cssVar.colorBorderSecondary} !important;
    border-radius: 12px !important;
    transition: all 0.3s ease;
    &:hover {
      border-color: ${cssVar.colorPrimary} !important;
      background: rgba(255, 255, 255, 0.04) !important;
    }
  `,
  historySection: css`
    width: 100%;
    background: rgba(255, 255, 255, 0.01);
    backdrop-filter: blur(15px);
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 20px;
    padding: 24px;
  `,
  toolbar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
  `,
  historyTable: css`
    .ant-table {
      background: transparent !important;
    }
    .ant-table-thead > tr > th {
      background: rgba(255, 255, 255, 0.02) !important;
      color: ${cssVar.colorTextSecondary} !important;
      border-bottom: 1px solid ${cssVar.colorBorderSecondary} !important;
    }
    .ant-table-tbody > tr > td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
    }
    .ant-table-tbody > tr:hover > td {
      background: rgba(255, 255, 255, 0.02) !important;
    }
    .ant-pagination-item-active {
      border-color: ${cssVar.colorPrimary} !important;
      background: transparent !important;
    }
  `
}));

const LEVEL_REWARDS = [
  { level: 10, name: "Fond d'écran mAI - Niveau 10", url: 'https://upload.fs.fr/NpjISr5v0u.png', desc: "Fond d'écran mAI exclusif pour célébrer le passage au niveau 10." },
  { level: 20, name: "Fond d'écran mAI - Niveau 20", url: 'https://upload.fs.fr/BAAdyao8xw.png', desc: "Fond d'écran mAI aux inspirations spatiales et technologiques." },
  { level: 30, name: "Fond d'écran mAI - Niveau 30", url: 'https://upload.fs.fr/odxyhuFB6x.png', desc: "Fond d'écran mAI néon haute fidélité pour votre bureau." },
  { level: 40, name: "Fond d'écran mAI - Niveau 40", url: 'https://upload.fs.fr/iycITGVLDt.png', desc: "Fond d'écran mAI abstrait généré avec le moteur premium mDevs." },
  { level: 50, name: "Fond d'écran mAI - Niveau 50", url: 'https://upload.fs.fr/rCZU8cmpMm.png', desc: "Le fond d'écran mAI de célébration ultime pour le niveau 50." },
  { level: 100, name: 'Logos spéciaux mAI - Niveau 100', url: 'https://upload.fs.fr/fBHTd26bOA.zip', desc: "Archive contenant la collection complète des logos vectoriels mAI spéciaux." },
];

export const LevelsPage = () => {
  const token = useTheme();
  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const logs = useGamificationStore((s) => s.logs || []);
  const actionCounts = useGamificationStore((s) => s.actionCounts || {});
  const unlockedBadges = useGamificationStore((s) => s.unlockedBadges || []);

  const totalActions = useMemo(() => {
    return Object.values(actionCounts).reduce((a, b) => a + b, 0);
  }, [actionCounts]);

  const currentLevelXp = xp - ((level - 1) * 200);
  const progressPercent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / 200) * 100)));

  // Filter States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'quest' | 'badge'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filtered logs memo
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (search && !log.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== 'all' && log.type !== typeFilter) return false;

        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (dateFilter === 'today') {
          return logDate.toDateString() === now.toDateString();
        }
        if (dateFilter === 'week') {
          return now.getTime() - log.timestamp <= 7 * 24 * 60 * 60 * 1000;
        }
        if (dateFilter === 'month') {
          return now.getTime() - log.timestamp <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp;
        if (sortBy === 'oldest') return a.timestamp - b.timestamp;
        if (sortBy === 'highest') return b.mpReward - a.mpReward;
        if (sortBy === 'lowest') return a.mpReward - b.mpReward;
        return 0;
      });
  }, [logs, search, typeFilter, dateFilter, sortBy]);

  const totalGains = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + curr.mpReward, 0);
  }, [filteredLogs]);

  const getLogIcon = (title: string, type: 'quest' | 'badge') => {
    if (type === 'badge') return <Award size={16} style={{ color: 'var(--color-warning)' }} />;
    const t = title.toLowerCase();
    if (t.includes('message') || t.includes('discuter') || t.includes('discussion')) {
      return <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />;
    }
    if (t.includes('plugin') || t.includes('outil')) {
      return <Puzzle size={16} style={{ color: 'var(--color-info)' }} />;
    }
    if (t.includes('créer') || t.includes('agent')) {
      return <Sparkles size={16} style={{ color: 'var(--color-success)' }} />;
    }
    return <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />;
  };

  const columns = [
    {
      title: 'N°',
      key: 'index',
      width: 70,
      render: (_text: any, _record: any, index: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-text-description)' }}>
          #{filteredLogs.length - index}
        </span>
      ),
    },
    {
      title: 'Date & Heure',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (ts: number) => {
        const d = new Date(ts);
        return (
          <span style={{ color: 'var(--color-text-description)', fontSize: 13 }}>
            {d.toLocaleString('fr-FR')}
          </span>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: 'quest' | 'badge') => {
        const isQuest = type === 'quest';
        return (
          <Tag color={isQuest ? 'cyan' : 'magenta'} style={{ fontWeight: '600' }}>
            {isQuest ? 'Quête' : 'Badge'}
          </Tag>
        );
      },
    },
    {
      title: 'Nom de la récompense',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <Flexbox horizontal align="center" gap={8}>
          {getLogIcon(title, record.type)}
          <span style={{ fontWeight: '500' }}>{title}</span>
        </Flexbox>
      ),
    },
    {
      title: 'Gain',
      dataIndex: 'mpReward',
      key: 'mpReward',
      width: 120,
      align: 'right' as const,
      render: (mp: number, record: any) => {
        if (record.type === 'badge') {
          return (
            <Tag color="success" style={{ fontWeight: 'bold', border: '1px solid var(--color-success-border)' }}>
              Débloqué
            </Tag>
          );
        }
        return (
          <Tag color="success" style={{ fontWeight: 'bold', border: '1px solid var(--color-success-border)' }}>
            +{mp} MP
          </Tag>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Flexbox align="center" gap={8}>
        <Title level={2} style={{ margin: 0 }}>Niveau</Title>
        <Text type="secondary">Explorez, progressez et débloquez des récompenses exclusives.</Text>
      </Flexbox>
      
      <div className={styles.levelCircle}>
        <Progress 
          type="circle" 
          percent={progressPercent} 
          size={300} 
          strokeWidth={6}
          strokeColor={{ '0%': token.colorPrimary, '100%': token.colorInfo }}
          format={() => (
            <Flexbox align="center" gap={0} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Text type="secondary" style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 }}>Niveau</Text>
              <div className={styles.levelNumber}>{level}</div>
            </Flexbox>
          )}
        />
      </div>

      <div className={styles.progressText}>
        {currentLevelXp} / 200 MP
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Trophy size={24} style={{ color: 'var(--color-warning)', marginBottom: 8 }} />
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>MP Total</Text>
          <Title level={4} style={{ margin: 0 }}>{xp} MP</Title>
        </div>
        <div className={styles.statCard}>
          <CheckSquare size={24} style={{ color: 'var(--color-success)', marginBottom: 8 }} />
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>Actions Réalisées</Text>
          <Title level={4} style={{ margin: 0 }}>{totalActions}</Title>
        </div>
        <div className={styles.statCard}>
          <Award size={24} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>Badges Débloqués</Text>
          <Title level={4} style={{ margin: 0 }}>{unlockedBadges.length} / 100</Title>
        </div>
      </div>

      <div className={styles.rewardsSection}>
        <Title level={3} style={{ marginBottom: 8 }}>Récompenses de niveau</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Téléchargez vos récompenses exclusives mAI dès que vous franchissez les paliers de niveau.
        </Text>
        <div className={styles.rewardsGrid}>
          {LEVEL_REWARDS.map((r) => {
            const isUnlocked = level >= r.level;
            return (
              <Card className={styles.rewardCard} key={r.level} style={{ opacity: isUnlocked ? 1 : 0.6 }}>
                <Flexbox align="center" justify="space-between" horizontal style={{ width: '100%' }}>
                  <Flexbox gap={4} style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag color={isUnlocked ? 'success' : 'default'} style={{ fontWeight: 'bold' }}>
                        Niveau {r.level}
                      </Tag>
                      <Title level={5} style={{ margin: 0 }}>{r.name}</Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>{r.desc}</Text>
                  </Flexbox>
                  <Button
                    type={isUnlocked ? 'primary' : 'default'}
                    disabled={!isUnlocked}
                    icon={isUnlocked ? <Download size={14} /> : <Lock size={14} />}
                    onClick={() => {
                      if (isUnlocked) {
                        window.open(r.url, '_blank');
                      }
                    }}
                  >
                    {isUnlocked ? 'Télécharger' : 'Verrouillé'}
                  </Button>
                </Flexbox>
              </Card>
            );
          })}
        </div>
      </div>

      <div className={styles.historySection}>
        <Title level={3} style={{ margin: 0, marginBottom: 16 }}>Historique des gains</Title>
        
        <div className={styles.toolbar}>
          <Input
            placeholder="Rechercher..."
            prefix={<Search size={14} style={{ color: 'var(--color-text-description)' }} />}
            style={{ width: '100%', maxWidth: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: 'Tous les types' },
              { value: 'quest', label: 'Quêtes' },
              { value: 'badge', label: 'Badges' },
            ]}
          />
          <Select
            value={dateFilter}
            onChange={(val) => setDateFilter(val)}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'Toutes les dates' },
              { value: 'today', label: "Aujourd'hui" },
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois-ci' },
            ]}
          />
          <Select
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            style={{ width: 150 }}
            options={[
              { value: 'newest', label: 'Plus récent' },
              { value: 'oldest', label: 'Plus ancien' },
              { value: 'highest', label: 'MP le plus élevé' },
              { value: 'lowest', label: 'MP le plus bas' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--color-text-description)' }}>
          <span>{filteredLogs.length} résultat{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}</span>
          <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>Gains cumulés : +{totalGains} MP</span>
        </div>

        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5, showSizeChanger: false, hideOnSinglePage: true }}
          className={styles.historyTable}
          locale={{ emptyText: <Empty description="Aucun historique disponible." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </div>
    </div>
  );
};

export default LevelsPage;
