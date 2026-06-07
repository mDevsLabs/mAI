'use client';

import { Avatar, Form, Icon, SliderWithInput, Flexbox } from '@lobehub/ui';
import { Button, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { PawPrint, Store } from 'lucide-react';
import { memo, useState } from 'react';


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

  const selectedPets = general?.pets || [];
  const enablePets = general?.enablePets ?? false;
  const petsLevel = general?.petsLevel || 1;

  const gainXp = () => {
    setSettings({ general: { petsLevel: Math.min(100, petsLevel + 1) } });
  };

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
      <Flexbox gap={16} width={'100%'} style={{ opacity: enablePets ? 1 : 0.5, pointerEvents: enablePets ? 'auto' : 'none' }}>
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
          {selectedPets.length === 0 && (
            <div style={{ color: 'var(--color-text-description)', fontSize: 13, padding: 12 }}>
              {t('settingPets.list.empty')}
            </div>
          )}
        </Flexbox>
        <Flexbox horizontal align={'center'} gap={12} padding={12} style={{ background: 'var(--color-fill-secondary)', borderRadius: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>Niveau {petsLevel}</div>
          <div style={{ flex: 1, height: 8, background: 'var(--color-fill-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${petsLevel === 100 ? 100 : (petsLevel % 10) * 10}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s' }} />
          </div>
          <Button size="small" type="primary" onClick={gainXp} disabled={!enablePets || petsLevel >= 100}>
            Interagir (+1 Niveau)
          </Button>
        </Flexbox>
        {petsLevel >= 100 && (
          <div style={{ color: 'var(--color-primary)', fontSize: 12, textAlign: 'center' }}>
            🎉 Niveau maximum atteint ! Vous pouvez maintenant avoir 2 Pets.
          </div>
        )}
        <Button
          block
          disabled={!enablePets}
          icon={<Icon icon={Store} />}
          onClick={() => setIsModalOpen(true)}
          type={'dashed'}
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
        disabled={!enablePets || petsLevel < 10}
        max={3}
        min={0.5}
        step={0.1}
        marks={{ 0.5: 'Min', 3: 'Max' }}
        style={{ width: 240 }}
      />
    ),
    desc: petsLevel >= 10 ? t('settingPets.zoom.desc') : '🔒 Débloqué au niveau 10',
    label: t('settingPets.zoom.title'),
    minWidth: undefined,
    name: 'petsZoom',
  };

  const petsSoundItem = {
    children: <Switch disabled={!enablePets || petsLevel < 20} />,
    desc: petsLevel >= 20 ? 'Activer les sons ludiques des pets.' : '🔒 Débloqué au niveau 20',
    label: 'Effets Sonores',
    minWidth: undefined,
    name: 'petsSound',
    valuePropName: 'checked',
  };

  const petsAnimItem = {
    children: <Switch disabled={!enablePets || petsLevel < 30} />,
    desc: petsLevel >= 30 ? 'Activer des animations avancées pour vos pets.' : '🔒 Débloqué au niveau 30',
    label: 'Animations Avancées',
    minWidth: undefined,
    name: 'petsAnim',
    valuePropName: 'checked',
  };

  const petsAccItem = {
    children: <Switch disabled={!enablePets || petsLevel < 40} />,
    desc: petsLevel >= 40 ? 'Activer les accessoires pour vos pets.' : '🔒 Débloqué au niveau 40',
    label: 'Accessoires virtuels',
    minWidth: undefined,
    name: 'petsAcc',
    valuePropName: 'checked',
  };

  const petsBgItem = {
    children: <Switch disabled={!enablePets || petsLevel < 50} />,
    desc: petsLevel >= 50 ? 'Activer les arrière-plans animés.' : '🔒 Débloqué au niveau 50',
    label: 'Arrière-plans',
    minWidth: undefined,
    name: 'petsBg',
    valuePropName: 'checked',
  };

  const petsColorItem = {
    children: <Switch disabled={!enablePets || petsLevel < 60} />,
    desc: petsLevel >= 60 ? 'Activer les couleurs personnalisées.' : '🔒 Débloqué au niveau 60',
    label: 'Couleurs',
    minWidth: undefined,
    name: 'petsColor',
    valuePropName: 'checked',
  };

  const petsWeatherItem = {
    children: <Switch disabled={!enablePets || petsLevel < 70} />,
    desc: petsLevel >= 70 ? 'Activer les effets météo.' : '🔒 Débloqué au niveau 70',
    label: 'Météo',
    minWidth: undefined,
    name: 'petsWeather',
    valuePropName: 'checked',
  };

  const petsVoiceItem = {
    children: <Switch disabled={!enablePets || petsLevel < 80} />,
    desc: petsLevel >= 80 ? 'Activer les petites voix.' : '🔒 Débloqué au niveau 80',
    label: 'Voix',
    minWidth: undefined,
    name: 'petsVoice',
    valuePropName: 'checked',
  };

  const petsAuraItem = {
    children: <Switch disabled={!enablePets || petsLevel < 90} />,
    desc: petsLevel >= 90 ? 'Activer l\'aura magique autour du pet.' : '🔒 Débloqué au niveau 90',
    label: 'Aura',
    minWidth: undefined,
    name: 'petsAura',
    valuePropName: 'checked',
  };

  return (
    <>
      <SettingHeader title={t('tab.pets')} />
      <Form
        collapsible={false}
        initialValues={general}
        items={[
          {
            children: [
              enablePetsItem,
              petsItem,
              petsZoomItem,
              petsSoundItem,
              petsAnimItem,
              petsAccItem,
              petsBgItem,
              petsColorItem,
              petsWeatherItem,
              petsVoiceItem,
              petsAuraItem,
            ],
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
