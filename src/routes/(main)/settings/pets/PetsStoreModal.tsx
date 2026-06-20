'use client';

import { Avatar, SearchBar, Modal, Segmented, Flexbox } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { memo, useMemo, useState } from 'react';


import { PETS_LIST, type PetCategory } from '@/const/pets';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';
import { useTranslation } from 'react-i18next';

interface PetsStoreModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const PetsStoreModal = memo<PetsStoreModalProps>(({ onOpenChange, open }) => {
  const { t } = useTranslation('setting');
  const { general } = useUserStore(settingsSelectors.currentSettings);
  const setSettings = useUserStore((s) => s.setSettings);
  const selectedPets = general?.pets || ['claude-pixel'];
  const maxPets = 1;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | PetCategory>('All');

  const filteredPets = useMemo(() => {
    return PETS_LIST.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search, category]);

  const categoryOptions = [
    { label: t('settingPets.store.category.all'), value: 'All' },
    { label: t('settingPets.store.category.animal'), value: 'Animal' },
    { label: t('settingPets.store.category.mascot'), value: 'Mascot' },
    { label: t('settingPets.store.category.human'), value: 'Human' },
    { label: t('settingPets.store.category.robot'), value: 'Robot' },
    { label: t('settingPets.store.category.alien'), value: 'Alien' },
  ];

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const togglePet = (petId: string) => {
    playSound();
    let newPets: string[] = [];
    if (!selectedPets.includes(petId)) {
      newPets = [petId];
      setSettings({ general: { pets: newPets, enablePets: true } });
    } else {
      setSettings({ general: { pets: newPets, enablePets: false } });
    }
  };

  return (
    <Modal
      onCancel={() => onOpenChange(false)}
      open={open}
      title={t('settingPets.store.title')}
      width={800}
      footer={null}
    >
      <Flexbox gap={16} paddingBlock={16}>
        <Flexbox horizontal align={'center'} gap={16}>
          <Segmented
            options={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v as 'All' | PetCategory)}
            style={{ flexShrink: 0 }}
          />
          <SearchBar
            allowClear
            onInputChange={setSearch}
            placeholder={t('settingPets.store.searchPlaceholder')}
            value={search}
            style={{ flex: 1 }}
          />
        </Flexbox>
        <Flexbox style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 8 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 12,
              paddingBlockEnd: 16,
            }}
          >
            {filteredPets.map((pet) => {
              const isSelected = selectedPets.includes(pet.id);
              return (
                <Flexbox
                  key={pet.id}
                  gap={16}
                  padding={16}
                  onClick={() => togglePet(pet.id)}
                  style={{
                    background: isSelected ? 'var(--color-fill-secondary)' : 'var(--color-fill-quaternary)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = isSelected ? 'scale(0.98)' : 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isSelected ? 'scale(0.98)' : 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = isSelected ? 'scale(0.98)' : 'scale(1.02)';
                  }}
                >
                  <Flexbox horizontal align={'center'} gap={16}>
                    <Avatar avatar={`/pets/${pet.id}/${pet.id}-idle.gif`} size={56} style={{ background: 'transparent' }} />
                    <Flexbox flex={1} style={{ overflow: 'hidden' }}>
                      <Typography.Text strong ellipsis style={{ fontSize: 16 }}>
                        {pet.name}
                      </Typography.Text>
                      <Typography.Text type={'secondary'} ellipsis style={{ fontSize: 13 }}>
                        {pet.description}
                      </Typography.Text>
                    </Flexbox>
                  </Flexbox>
                  <Flexbox horizontal justify={'flex-end'} width={'100%'}>
                    <Button
                      type={isSelected ? 'default' : 'primary'}
                      style={{ minWidth: 80, pointerEvents: 'none' }}
                    >
                      {isSelected ? t('settingPets.store.action.remove') : t('settingPets.store.action.add')}
                    </Button>
                  </Flexbox>
                </Flexbox>
              );
            })}
          </div>
          {filteredPets.length === 0 && (
            <Flexbox align={'center'} padding={24}>
              <Typography.Text type={'secondary'}>{t('settingPets.store.empty')}</Typography.Text>
            </Flexbox>
          )}
          <Flexbox align={'center'} paddingBlock={24}>
            <Typography.Text type={'secondary'}>
              {t('settingPets.store.comingSoon')}
              <a href="https://x.com/mDevsLabs" target="_blank" rel="noreferrer">
                @mDevsLabs
              </a>
            </Typography.Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Modal>
  );
});

export default PetsStoreModal;
