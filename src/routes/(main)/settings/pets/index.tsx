'use client';

import { Avatar, Flexbox, Form, Icon, SliderWithInput } from '@lobehub/ui';
import { Button, Switch, ColorPicker, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { PawPrint, Sliders, Store } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { PETS_LIST } from '@/const/pets';
import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

import PetsStoreModal from './PetsStoreModal';

const Page = memo(() => {
  const { t } = useTranslation('setting');
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const selectedPets = general?.pets || [];
  const enablePets = general?.enablePets ?? false;
  const petsLevel = general?.petsLevel || 1;

  const enablePetsItem = {
    children: <Switch />,
    desc: t('settingPets.enable.desc'),
    label: t('settingPets.enable.title'),
    minWidth: undefined,
    name: 'enablePets',
    valuePropName: 'checked',
  };

  const petsItem = {
    children: (
      <Flexbox
        gap={16}
        style={{ opacity: enablePets ? 1 : 0.5, pointerEvents: enablePets ? 'auto' : 'none' }}
        width={'100%'}
      >
        <Flexbox horizontal gap={12} wrap={'wrap'}>
          {selectedPets.map((petId) => {
            const petConfig = PETS_LIST.find((p) => p.id === petId);
            if (!petConfig) return null;
            const imagePrefix = petConfig.imagePrefix || petId;
            return (
              <Flexbox
                horizontal
                align={'center'}
                gap={12}
                key={petId}
                padding={12}
                style={{
                  background: 'var(--color-fill-tertiary)',
                  borderRadius: 8,
                  flex: 1,
                  minWidth: 200,
                }}
              >
                <Avatar
                  avatar={`/pets/${petId}/${imagePrefix}-idle.gif`}
                  size={48}
                  style={{ background: 'transparent' }}
                />
                <Flexbox flex={1}>
                  <div style={{ fontWeight: 'bold' }}>{petConfig.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-description)' }}>
                    {petConfig.description}
                  </div>
                </Flexbox>
              </Flexbox>
            );
          })}
          {selectedPets.length === 0 && (
            <div style={{ color: 'var(--color-text-description)', fontSize: 13, padding: 12 }}>
              {t('settingPets.list.empty')}
            </div>
          )}
        </Flexbox>
        <Button
          block
          disabled={!enablePets}
          icon={<Icon icon={Store} />}
          type={'dashed'}
          onClick={() => setIsModalOpen(true)}
        >
          {t('settingPets.list.openStore')}
        </Button>
      </Flexbox>
    ),
    desc: t('settingPets.list.desc'),
    label: t('settingPets.list.title'),
    minWidth: undefined,
  };

  const petsZoomItem = {
    children: (
      <SliderWithInput
        disabled={!enablePets}
        marks={{ 0.5: <span style={{ whiteSpace: 'nowrap' }}>Min</span>, 3: <span style={{ whiteSpace: 'nowrap' }}>Max</span> }}
        max={3}
        min={0.5}
        step={0.1}
        style={{ width: 350 }}
      />
    ),
    desc: t('settingPets.zoom.desc'),
    label: t('settingPets.zoom.title'),
    minWidth: undefined,
    name: 'petsZoom',
  };

  const petsSoundItem = {
    children: <Switch disabled={!enablePets} defaultChecked={false} />,
    desc: 'Activer les sons ludiques des pets.',
    label: 'Son du pet',
    minWidth: undefined,
    name: 'petsSound',
    valuePropName: 'checked',
  };

  const soundEnabled = enablePets && !!general?.petsSound;

  const petsVolumeItem = {
    children: (
      <Flexbox
        horizontal
        align={'center'}
        gap={12}
        width={'100%'}
        style={{
          opacity: soundEnabled ? 1 : 0.45,
          pointerEvents: soundEnabled ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <SliderWithInput
          disabled={!soundEnabled}
          marks={{ 0: <span style={{ whiteSpace: 'nowrap' }}>Min</span>, 1: <span style={{ whiteSpace: 'nowrap' }}>Max</span> }}
          max={1}
          min={0}
          step={0.1}
          style={{ width: 350 }}
        />
      </Flexbox>
    ),
    desc: soundEnabled ? 'Réglez le volume des pets' : 'Activez Son du pet pour régler le volume',
    label: 'Volume du son',
    minWidth: undefined,
    name: 'petsVolume',
    divider: false,
  };

  const petsCitationsItem = {
    children: <Switch disabled={!enablePets} defaultChecked={false} />,
    desc: 'Activer l\'affichage de textes et citations.',
    label: 'Citations',
    minWidth: undefined,
    name: 'petsCitations',
    valuePropName: 'checked',
  };

  const auraEnabled = enablePets && !!general?.petsAura;

  const petsAuraItem = {
    children: (
      <Flexbox horizontal align={'center'} gap={12}>
        <Switch disabled={!enablePets} defaultChecked={false} />
        <ColorPicker
          disabled={!auraEnabled}
          showText
          format="hex"
          onChange={(color) => {
            setSettings({ general: { ...general, petsAuraColor: color.toHexString() } });
          }}
          value={general?.petsAuraColor || '#1677ff'}
        />
      </Flexbox>
    ),
    desc: 'Activer une traînée lumineuse suivant le pet au déplacement.',
    label: 'Aura',
    minWidth: undefined,
    name: 'petsAura',
    valuePropName: 'checked',
  };

  const petsAuraDynamicTrailsItem = {
    children: (
      <Flexbox horizontal align={'center'} gap={12}>
        <Switch disabled={!enablePets} defaultChecked={false} />
        <Select
          disabled={!enablePets || !general?.petsAuraDynamicTrails}
          options={[
            { label: 'Étoiles', value: 'stars' },
            { label: 'Confettis', value: 'confetti' },
            { label: 'Pixels Rétro', value: 'retro-pixels' },
            { label: 'Bulles', value: 'bubbles' },
          ]}
          onChange={(value) => {
            setSettings({ general: { ...general, petsAuraTrailStyle: value } });
          }}
          value={general?.petsAuraTrailStyle || 'stars'}
          style={{ width: 140 }}
        />
      </Flexbox>
    ),
    desc: 'Permet de choisir différents styles de traînées au lieu d\'une simple traînée lumineuse.',
    label: 'Traînées dynamiques 🌈',
    minWidth: undefined,
    name: 'petsAuraDynamicTrails',
    valuePropName: 'checked',
  };

  const petsAuraMoodItem = {
    children: <Switch disabled={!enablePets} defaultChecked={false} />,
    desc: 'Modifie automatiquement la couleur et l\'intensité de l\'Aura selon l\'activité de l\'agent mAI.',
    label: 'Effet selon l\'humeur 😠🥰',
    minWidth: undefined,
    name: 'petsAuraMood',
    valuePropName: 'checked',
  };

  const petsEncouragementsItem = {
    children: <Switch disabled={!enablePets} defaultChecked={false} />,
    desc: 'Activer les encouragements et félicitations du pet.',
    label: 'Encouragements et félicitations',
    minWidth: undefined,
    name: 'petsEncouragements',
    valuePropName: 'checked',
  };

  const petsCustomAnimItem = {
    children: <Switch disabled={!enablePets} defaultChecked={false} />,
    desc: 'Déclenche des animations et particules en cliquant deux fois ou en caressant le pet.',
    label: 'Animations personnalisées 🪄',
    minWidth: undefined,
    name: 'petsCustomAnim',
    valuePropName: 'checked',
  };

  return (
    <>
      <SettingHeader title={t('tab.pets')} />
      <Form
        collapsible={false}
        initialValues={general}
        itemsType={'group'}
        variant={'filled'}
        items={[
          {
            children: [
              enablePetsItem,
              petsItem,
            ],
            title: t('settingPets.section.choice'),
            icon: PawPrint,
          },
          {
            children: [
              petsZoomItem,
              petsSoundItem,
              petsVolumeItem,
              petsCitationsItem,
              petsAuraItem,
              petsAuraDynamicTrailsItem,
              petsAuraMoodItem,
              petsEncouragementsItem,
              petsCustomAnimItem,
            ],
            title: t('settingPets.section.options'),
            icon: Sliders,
          },
        ]}
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
