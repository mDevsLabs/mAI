'use client';

import { Flexbox } from '@lobehub/ui';
import { Input, Segmented, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { Search } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import badgesCatalog from '@/const/gamification/badgesCatalog.json';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';

import { BadgeCard } from './BadgeCard';
import { BadgeIdentityModal } from './BadgeIdentityModal';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  toolbar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    opacity: 0;
    animation: slideDown 0.5s ease-out 0.2s forwards;

    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  grid: css`
    display: grid;
    gap: 20px;
    opacity: 0;
    animation: gridFadeIn 0.5s ease-out 0.3s forwards;

    @keyframes gridFadeIn {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
}));

export const BadgesList = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('Tous');
  const [columns, setColumns] = useState<number>(4);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  const unlockedBadges = useGamificationStore(gamificationSelectors.unlockedBadges);
  const pinnedBadges = useGamificationStore(gamificationSelectors.pinnedBadges);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const filteredBadges = useMemo(() => {
    return badgesCatalog.filter((badge) => {
      if (search && !badge.name.toLowerCase().includes(search.toLowerCase())) return false;
      const isUnlocked = unlockedBadges.includes(badge.id);
      const isPinned = pinnedBadges.includes(badge.id);

      if (filter === 'Débloqués' && !isUnlocked) return false;
      if (filter === 'Verrouillés' && isUnlocked) return false;
      if (filter === 'Épinglés' && !isPinned) return false;

      return true;
    });
  }, [search, filter, unlockedBadges, pinnedBadges]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          placeholder="Rechercher un badge..."
          prefix={<Search size={16} />}
          style={{ width: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Segmented
          options={['Tous', 'Débloqués', 'Verrouillés', 'Épinglés']}
          value={filter}
          onChange={(val) => setFilter(val as string)}
        />
        <Segmented
          options={[3, 4, 6]}
          value={columns}
          onChange={(val) => setColumns(val as number)}
        />
      </div>

      {loading ? (
        <Flexbox align="center" justify="center" style={{ minHeight: 400, width: '100%' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: 'var(--color-text-description)', fontSize: 16 }}>Chargement...</div>
        </Flexbox>
      ) : (
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            const isPinned = pinnedBadges.includes(badge.id);
            return (
              <BadgeCard
                badge={badge}
                isPinned={isPinned}
                isUnlocked={isUnlocked}
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
              />
            );
          })}
        </div>
      )}

      {selectedBadge && (
        <BadgeIdentityModal
          badge={selectedBadge}
          isPinned={pinnedBadges.includes(selectedBadge.id)}
          isUnlocked={unlockedBadges.includes(selectedBadge.id)}
          open={!!selectedBadge}
          onCancel={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default BadgesList;
