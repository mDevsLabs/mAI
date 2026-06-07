'use client';

import { Avatar, Form, Icon, SliderWithInput } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { PawPrint, Store } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { PETS_LIST } from '@/const/pets';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useTranslation } from 'react-i18next';

import PetsStoreModal from './PetsStoreModal';

const Page = memo(() => {
  const { t } = useTranslation('setting');
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const selectedPets = general?.pets || ['claude-pixel'];

  const petsItem = {
    children: (
      <Flexbox gap={16} width={'100%'}>
        <Flexbox horizontal gap={12} wrap={'wrap'}>
          {selectedPets.map((petId) => {
            const petConfig = PETS_LIST.find((p) => p.id === petId);
            if (!petConfig) return null;
            return (
              <Flexbox
                key={petId}
                horizontal
                align={'center'}
                gap={12}
                padding={12}
                style={{
                  background: 'var(--color-fill-tertiary)',
                  borderRadius: 8,
                  flex: 1,
                  minWidth: 200,
                }}
              >
                <Avatar avatar={`/pets/${petId}/${petId}-idle.gif`} size={48} style={{ background: 'transparent' }} />
                <Flexbox flex={1}>
                  <div style={{ fontWeight: 'bold' }}>{petConfig.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-description)' }}>
                    {petConfig.description}
                  </div>
                </Flexbox>
              </Flexbox>
            );
          })}
        </Flexbox>
        <Button
          block
          icon={<Icon icon={Store} />}
          onClick={() => setIsModalOpen(true)}
          type={'dashed'}
        >
          Ouvrir le Store des Pets
        </Button>
      </Flexbox>
    ),
    desc: 'Les pets vous accompagnent dans mAI ! Choisissez en un qui vous correspond !',
    label: 'Compagnons Virtuels',
    minWidth: undefined,
  };

  const petsZoomItem = {
    children: (
      <SliderWithInput
        max={3}
        min={0.5}
        step={0.1}
        marks={{ 0.5: 'Min', 3: 'Max' }}
      />
    ),
    desc: 'Ajustez la taille d\'affichage de vos pets.',
    label: 'Taille (Zoom)',
    minWidth: undefined,
    name: 'petsZoom',
  };

  return (
    <>
      <SettingHeader title={t('tab.pets')} />
      <Form
        collapsible={false}
        initialValues={general}
        items={[
          {
            children: [petsItem, petsZoomItem],
            title: 'Pets',
            icon: PawPrint,
          },
        ]}
        itemsType={'group'}
        variant={'filled'}
        onValuesChange={async (value) => {
          await setSettings({ general: value });
        }}
        {...FORM_STYLE}
      />
      <PetsStoreModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
});

export default Page;
