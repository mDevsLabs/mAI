'use client';

import { Avatar, Flexbox, Form, Icon, SliderWithInput } from '@lobehub/ui';
import { Button, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { Lock, PawPrint, Store } from 'lucide-react';
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
                  avatar={`/pets/${petId}/${petId}-idle.gif`}
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
        <Flexbox
          horizontal
          align={'center'}
          gap={12}
          padding={12}
          style={{ background: 'var(--color-fill-secondary)', borderRadius: 8 }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>Niveau {petsLevel}</div>
          <div
            style={{
              flex: 1,
              height: 8,
              background: 'var(--color-fill-tertiary)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${petsLevel === 100 ? 100 : ((general?.petsMsgCount || 0) % 10) * 10}%`,
                height: '100%',
                background: 'var(--color-primary)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-description)' }}>
            {petsLevel === 100 ? 'Max' : `${(general?.petsMsgCount || 0) % 10} / 10 msgs`}
          </div>
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
        disabled={!enablePets || petsLevel < 10}
        marks={{ 0.5: <span style={{ whiteSpace: 'nowrap' }}>Min</span>, 3: <span style={{ whiteSpace: 'nowrap' }}>Max</span> }}
        max={3}
        min={0.5}
        step={0.1}
        style={{ width: 350 }}
      />
    ),
    desc:
      petsLevel >= 10 ? (
        t('settingPets.zoom.desc')
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 10
        </>
      ),
    label: t('settingPets.zoom.title'),
    minWidth: undefined,
    name: 'petsZoom',
  };

  const petsSoundItem = {
    children: <Switch disabled={!enablePets || petsLevel < 90} defaultChecked={false} />,
    desc:
      petsLevel >= 90 ? (
        'Activer les sons ludiques des pets.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 90
        </>
      ),
    label: 'Son du pet',
    minWidth: undefined,
    name: 'petsSound',
    valuePropName: 'checked',
    divider: false,
  };

  const soundEnabled = enablePets && petsLevel >= 90 && !!general?.petsSound;

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
  };

  const petsAnimItem = {
    children: <Switch disabled={!enablePets || petsLevel < 30} />,
    desc:
      petsLevel >= 30 ? (
        'Activer des animations avancées pour vos pets.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 30
        </>
      ),
    label: 'Animations Avancées',
    minWidth: undefined,
    name: 'petsAnim',
    valuePropName: 'checked',
  };

  const petsAccItem = {
    children: <Switch disabled={!enablePets || petsLevel < 40} />,
    desc:
      petsLevel >= 40 ? (
        'Activer les accessoires pour vos pets.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 40
        </>
      ),
    label: 'Accessoires virtuels',
    minWidth: undefined,
    name: 'petsAcc',
    valuePropName: 'checked',
  };

  const petsBgItem = {
    children: <Switch disabled={!enablePets || petsLevel < 50} />,
    desc:
      petsLevel >= 50 ? (
        'Activer les arrière-plans animés.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 50
        </>
      ),
    label: 'Arrière-plans',
    minWidth: undefined,
    name: 'petsBg',
    valuePropName: 'checked',
  };

  const petsColorItem = {
    children: <Switch disabled={!enablePets || petsLevel < 60} />,
    desc:
      petsLevel >= 60 ? (
        'Activer les couleurs personnalisées.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 60
        </>
      ),
    label: 'Couleurs',
    minWidth: undefined,
    name: 'petsColor',
    valuePropName: 'checked',
  };

  const petsWeatherItem = {
    children: <Switch disabled={!enablePets || petsLevel < 70} />,
    desc:
      petsLevel >= 70 ? (
        'Activer les effets météo.'
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 70
        </>
      ),
    label: 'Météo',
    minWidth: undefined,
    name: 'petsWeather',
    valuePropName: 'checked',
  };

  const petsAuraItem = {
    children: <Switch disabled={!enablePets || petsLevel < 80} />,
    desc:
      petsLevel >= 80 ? (
        "Activer l'aura magique autour du pet."
      ) : (
        <>
          <Icon icon={Lock} /> Débloqué au niveau 80
        </>
      ),
    label: 'Aura',
    minWidth: undefined,
    name: 'petsAura',
    valuePropName: 'checked',
    divider: true,
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
              petsZoomItem,
              petsAnimItem,
              petsAccItem,
              petsBgItem,
              petsColorItem,
              petsWeatherItem,
              petsAuraItem,
              petsSoundItem,
              petsVolumeItem,
            ],
            title: 'Pets',
            icon: PawPrint,
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
