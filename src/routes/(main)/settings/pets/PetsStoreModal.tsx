'use client';

import { Avatar, SearchBar, Modal, Segmented, Flexbox } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { memo, useMemo, useState } from 'react';


import { PETS_LIST, type PetCategory } from '@/const/pets';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

interface PetsStoreModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const PetsStoreModal = memo<PetsStoreModalProps>(({ onOpenChange, open }) => {
  const { general } = useUserStore(settingsSelectors.currentSettings);
  const setSettings = useUserStore((s) => s.setSettings);
  const selectedPets = general?.pets || ['claude-pixel'];

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
    { label: 'Tous', value: 'All' },
    { label: 'Mascottes', value: 'Mascot' },
    { label: 'Humains', value: 'Human' },
    { label: 'Robots', value: 'Robot' },
    { label: 'Aliens', value: 'Alien' },
  ];

  const togglePet = (petId: string) => {
    let newPets = [...selectedPets];
    if (newPets.includes(petId)) {
      newPets = newPets.filter((id) => id !== petId);
    } else {
      if (newPets.length >= 2) {
        newPets.shift(); // keep max 2
      }
      newPets.push(petId);
    }
    setSettings({ general: { pets: newPets } });
  };

  return (
    <Modal
      onCancel={() => onOpenChange(false)}
      open={open}
      title={'Store des Pets'}
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
            placeholder={'Rechercher un pet...'}
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
                  style={{
                    background: isSelected ? 'var(--color-fill-secondary)' : 'var(--color-fill-quaternary)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12,
                    transition: 'all 0.2s',
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
                      onClick={() => togglePet(pet.id)}
                      type={isSelected ? 'default' : 'primary'}
                      style={{ minWidth: 80 }}
                    >
                      {isSelected ? 'Retirer' : 'Ajouter'}
                    </Button>
                  </Flexbox>
                </Flexbox>
              );
            })}
          </div>
          {filteredPets.length === 0 && (
            <Flexbox align={'center'} padding={24}>
              <Typography.Text type={'secondary'}>Aucun pet trouvé</Typography.Text>
            </Flexbox>
          )}
          <Flexbox align={'center'} paddingBlock={24}>
            <Typography.Text type={'secondary'}>
              D'autres pet arrivent bientôt ! Suivez-nous sur{' '}
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
