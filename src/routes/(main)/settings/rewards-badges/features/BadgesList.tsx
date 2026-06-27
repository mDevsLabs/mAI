'use client';

import { Input, Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import badgesCatalog from '@/const/gamification/badgesCatalog.json';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';

import { BadgeCard } from './BadgeCard';
import { BadgeIdentityModal } from './BadgeIdentityModal';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  toolbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  `,
  grid: css`
    display: grid;
    gap: 16px;
  `
}));

export const BadgesList = () => {
  const { styles } = useStyles();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [columns, setColumns] = useState<number>(4);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  const unlockedBadges = useGamificationStore(gamificationSelectors.unlockedBadges);
  const pinnedBadges = useGamificationStore(gamificationSelectors.pinnedBadges);

  const filteredBadges = useMemo(() => {
    return badgesCatalog.filter((badge) => {
      if (search && !badge.name.toLowerCase().includes(search.toLowerCase())) return false;
      const isUnlocked = unlockedBadges.includes(badge.id);
      const isPinned = pinnedBadges.includes(badge.id);

      if (filter === 'Unlocked' && !isUnlocked) return false;
      if (filter === 'Locked' && isUnlocked) return false;
      if (filter === 'Pinned' && !isPinned) return false;

      return true;
    });
  }, [search, filter, unlockedBadges, pinnedBadges]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          prefix={<Search size={16} />}
          placeholder="Rechercher un badge..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Segmented
          options={['All', 'Unlocked', 'Locked', 'Pinned']}
          value={filter}
          onChange={(val) => setFilter(val as string)}
        />
        <Segmented
          options={[3, 4, 6]}
          value={columns}
          onChange={(val) => setColumns(val as number)}
        />
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          const isPinned = pinnedBadges.includes(badge.id);
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={isUnlocked}
              isPinned={isPinned}
              onClick={() => setSelectedBadge(badge)}
            />
          );
        })}
      </div>

      {selectedBadge && (
        <BadgeIdentityModal
          open={!!selectedBadge}
          onCancel={() => setSelectedBadge(null)}
          badge={selectedBadge}
          isUnlocked={unlockedBadges.includes(selectedBadge.id)}
          isPinned={pinnedBadges.includes(selectedBadge.id)}
        />
      )}
    </div>
  );
};

export default BadgesList;
