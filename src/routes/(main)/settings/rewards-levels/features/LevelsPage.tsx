'use client';

import { Flexbox } from '@lobehub/ui';
import { Typography, Progress, Table, Input, Select, Tag, Empty, Button } from 'antd';
import { createStaticStyles, useTheme } from 'antd-style';
import { Search, Trophy, CheckSquare, Award, Download, Lock, MessageSquare, Puzzle, Sparkles, CheckCircle2, Shield, Gift, ListTodo } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { useGamificationStore } from '@/store/gamification';

const { Title, Text } = Typography;

export const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    animation: fadeIn 0.5s ease-out;

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  dashboardRow: css`
    display: flex;
    gap: 24px;
    width: 100%;
    flex-wrap: wrap;
    align-items: stretch;
  `,
  leftColumn: css`
    flex: 1;
    min-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  rightColumn: css`
    flex: 1.2;
    min-width: 420px;
    display: flex;
    flex-direction: column;
  `,
  glassCard: css`
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  `,
  progressCard: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px !important;
  `,
  levelCircleWrapper: css`
    position: relative;
    width: 160px;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.01);
    box-shadow: 0 0 25px ${cssVar.colorPrimaryBorder};
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.03);
      box-shadow: 0 0 35px ${cssVar.colorPrimary};
    }
  `,
  levelNumber: css`
    font-size: 54px;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, ${cssVar.colorPrimary}, ${cssVar.colorInfo});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  progressText: css`
    margin-top: 16px;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  `,
  statsGrid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
  `,
  miniStatCard: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    text-align: center;
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      border-color: ${cssVar.colorPrimary};
      background: rgba(255, 255, 255, 0.02);
    }
  `,
  rewardList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  rewardListItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 10px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: ${cssVar.colorPrimaryBorder};
    }
  `,
  historyCard: css`
    width: 100%;
    margin-top: 8px;
  `,
  toolbar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  `,
  historyTable: css`
    .ant-table {
      background: transparent !important;
    }
    .ant-table-thead > tr > th {
      background: rgba(255, 255, 255, 0.01) !important;
      color: ${cssVar.colorTextSecondary} !important;
      border-bottom: 1px solid ${cssVar.colorBorderSecondary} !important;
    }
    .ant-table-tbody > tr > td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.02) !important;
    }
    .ant-table-tbody > tr:hover > td {
      background: rgba(255, 255, 255, 0.01) !important;
    }
    .ant-pagination-item-active {
      border-color: ${cssVar.colorPrimary} !important;
      background: transparent !important;
    }
  `
}));

const LEVEL_REWARDS = [
  { level: 10, name: "Fond d'écran mAI - Niveau 10", url: 'https://upload.fs.fr/NpjISr5v0u.png', desc: "Fond d'écran mAI exclusif pour le niveau 10." },
  { level: 20, name: "Fond d'écran mAI - Niveau 20", url: 'https://upload.fs.fr/BAAdyao8xw.png', desc: "Fond d'écran mAI aux inspirations technologiques." },
  { level: 30, name: "Fond d'écran mAI - Niveau 30", url: 'https://upload.fs.fr/odxyhuFB6x.png', desc: "Fond d'écran mAI néon haute fidélité pour votre bureau." },
  { level: 40, name: "Fond d'écran mAI - Niveau 40", url: 'https://upload.fs.fr/iycITGVLDt.png', desc: "Fond d'écran mAI abstrait généré avec le moteur mDevs." },
  { level: 50, name: "Fond d'écran mAI - Niveau 50", url: 'https://upload.fs.fr/rCZU8cmpMm.png', desc: "Le fond d'écran mAI de célébration pour le niveau 50." },
  { level: 100, name: 'Logos spéciaux mAI - Niveau 100', url: 'https://upload.fs.fr/fBHTd26bOA.zip', desc: "Collection complète des logos vectoriels mAI spéciaux." },
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

  // Calculate new stats
  const completedQuests = useMemo(() => {
    return logs.filter((l) => l.type === 'quest').length;
  }, [logs]);

  const userGrade = useMemo(() => {
    if (level >= 100) return 'Légende';
    if (level >= 50) return 'Maître';
    if (level >= 30) return 'Expert';
    if (level >= 20) return 'Adepte';
    if (level >= 10) return 'Initié';
    return 'Novice';
  }, [level]);

  const nextReward = useMemo(() => {
    const rewards = [10, 20, 30, 40, 50, 100];
    const next = rewards.find((r) => r > level);
    return next ? `Niveau ${next}` : 'Max atteint';
  }, [level]);

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
      <div className={styles.dashboardRow}>
        
        {/* Colonne Gauche : Progression & Statistiques */}
        <div className={styles.leftColumn}>
          
          {/* Card de Progression circulaire */}
          <div className={`${styles.glassCard} ${styles.progressCard}`} style={{ flex: 1.1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className={styles.levelCircleWrapper}>
              <Progress 
                type="circle" 
                percent={progressPercent} 
                size={160} 
                strokeWidth={5}
                strokeColor={{ '0%': token.colorPrimary, '100%': token.colorInfo }}
                format={() => null}
              />
              <Flexbox align="center" justify="center" gap={0} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%' }}>
                <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1, marginBottom: 2 }}>Niveau</Text>
                <div className={styles.levelNumber}>{level}</div>
              </Flexbox>
            </div>
            <div className={styles.progressText}>
              <span style={{ color: 'var(--color-primary)' }}>{currentLevelXp}</span>
              <span style={{ color: 'var(--color-text-description)', fontWeight: 'normal' }}> / 200 MP</span>
            </div>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              Encore <strong>{200 - currentLevelXp} MP</strong> pour atteindre le niveau suivant !
            </Text>
          </div>

          {/* Card de Statistiques contenant la grille */}
          <div className={styles.glassCard} style={{ flex: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Title level={5} style={{ margin: 0, marginBottom: 12 }}>Statistiques de progression</Title>
            <div className={styles.statsGrid}>
              <div className={styles.miniStatCard}>
                <Trophy size={15} style={{ color: 'var(--color-warning)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>MP Total</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{xp}</span>
              </div>
              <div className={styles.miniStatCard}>
                <CheckSquare size={15} style={{ color: 'var(--color-success)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Actions</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{totalActions}</span>
              </div>
              <div className={styles.miniStatCard}>
                <Award size={15} style={{ color: 'var(--color-primary)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Badges</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{unlockedBadges.length}</span>
              </div>
              <div className={styles.miniStatCard}>
                <ListTodo size={15} style={{ color: 'var(--color-info)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Quêtes</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{completedQuests}</span>
              </div>
              <div className={styles.miniStatCard}>
                <Shield size={15} style={{ color: 'var(--color-warning)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Grade</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{userGrade}</span>
              </div>
              <div className={styles.miniStatCard}>
                <Gift size={15} style={{ color: 'var(--color-primary)', marginBottom: 4 }} />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Cadeau Suivant</Text>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{nextReward}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Colonne Droite : Récompenses débloquées */}
        <div className={styles.rightColumn}>
          <div className={styles.glassCard} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title level={4} style={{ margin: 0, marginBottom: 4 }}>Récompenses de niveau</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              Débloquez et téléchargez vos fonds d'écran et logos exclusifs.
            </Text>
            
            <div className={styles.rewardList}>
              {LEVEL_REWARDS.map((r) => {
                const isUnlocked = level >= r.level;
                return (
                  <div className={styles.rewardListItem} key={r.level} style={{ opacity: isUnlocked ? 1 : 0.65 }}>
                    <Flexbox gap={2} style={{ flex: 1, paddingRight: 12 }}>
                      <Flexbox horizontal align="center" gap={8}>
                        <Tag color={isUnlocked ? 'success' : 'default'} style={{ fontWeight: 'bold', fontSize: 11 }}>
                          Lv. {r.level}
                        </Tag>
                        <span style={{ fontWeight: '600', fontSize: 13 }}>{r.name}</span>
                      </Flexbox>
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>{r.desc}</Text>
                    </Flexbox>
                    <Button
                      type={isUnlocked ? 'primary' : 'default'}
                      disabled={!isUnlocked}
                      size="small"
                      icon={isUnlocked ? <Download size={12} /> : <Lock size={12} />}
                      onClick={() => {
                        if (isUnlocked) {
                          window.open(r.url, '_blank');
                        }
                      }}
                      style={{ fontSize: 12 }}
                    >
                      {isUnlocked ? 'Télécharger' : 'Verrouillé'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Section Historique complète */}
      <div className={`${styles.glassCard} ${styles.historyCard}`}>
        <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Historique des gains</Title>
        
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: 'var(--color-text-description)' }}>
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
