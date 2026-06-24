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

interface AuraControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  auraEnabled?: boolean;
  colorValue?: string;
  onColorChange?: (color: string) => void;
}

const AuraControl = ({
  checked,
  onChange,
  disabled,
  auraEnabled,
  colorValue,
  onColorChange,
}: AuraControlProps) => {
  return (
    <Flexbox horizontal align={'center'} gap={12}>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
      <Flexbox
        style={{
          opacity: auraEnabled ? 1 : 0.45,
          pointerEvents: auraEnabled ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <ColorPicker
          disabled={!auraEnabled}
          showText
          format="hex"
          onChange={(color) => {
            onColorChange?.(color.toHexString());
          }}
          value={colorValue || '#1677ff'}
        />
      </Flexbox>
    </Flexbox>
  );
};

interface AuraOpacityControlProps {
  value?: number;
  onChange?: (value: number) => void;
  auraEnabled?: boolean;
}

const AuraOpacityControl = ({ value, onChange, auraEnabled }: AuraOpacityControlProps) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      gap={12}
      width={'100%'}
      style={{
        opacity: auraEnabled ? 1 : 0.45,
        pointerEvents: auraEnabled ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}
    >
      <SliderWithInput
        disabled={!auraEnabled}
        marks={{ 0.1: <span style={{ whiteSpace: 'nowrap' }}>Min</span>, 1: <span style={{ whiteSpace: 'nowrap' }}>Max</span> }}
        max={1}
        min={0.1}
        step={0.1}
        style={{ width: 350 }}
        value={value}
        onChange={onChange}
      />
    </Flexbox>
  );
};

interface DynamicTrailsControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  auraEnabled?: boolean;
  trailsEnabled?: boolean;
  trailStyleValue?: string;
  onTrailStyleChange?: (value: string) => void;
}

const DynamicTrailsControl = ({
  checked,
  onChange,
  auraEnabled,
  trailsEnabled,
  trailStyleValue,
  onTrailStyleChange,
}: DynamicTrailsControlProps) => {
  return (
    <Flexbox horizontal align={'center'} gap={12}>
      <Flexbox
        style={{
          opacity: auraEnabled ? 1 : 0.45,
          pointerEvents: auraEnabled ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <Switch checked={checked} onChange={onChange} disabled={!auraEnabled} />
      </Flexbox>
      <Flexbox
        style={{
          opacity: trailsEnabled ? 1 : 0.45,
          pointerEvents: trailsEnabled ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <Select
          disabled={!trailsEnabled}
          options={[
            { label: 'Étoiles', value: 'stars' },
            { label: 'Confettis', value: 'confetti' },
            { label: 'Pixels Rétro', value: 'retro-pixels' },
            { label: 'Bulles', value: 'bubbles' },
          ]}
          onChange={onTrailStyleChange}
          value={trailStyleValue || 'stars'}
          style={{ width: 140 }}
        />
      </Flexbox>
    </Flexbox>
  );
};

interface AuraMoodControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  auraEnabled?: boolean;
}

const AuraMoodControl = ({ checked, onChange, auraEnabled }: AuraMoodControlProps) => {
  return (
    <Flexbox
      style={{
        opacity: auraEnabled ? 1 : 0.45,
        pointerEvents: auraEnabled ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}
    >
      <Switch checked={checked} onChange={onChange} disabled={!auraEnabled} />
    </Flexbox>
  );
};

interface PetsVolumeControlProps {
  value?: number;
  onChange?: (value: number) => void;
  soundEnabled?: boolean;
}

const PetsVolumeControl = ({ value, onChange, soundEnabled }: PetsVolumeControlProps) => {
  return (
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
        value={value}
        onChange={onChange}
      />
    </Flexbox>
  );
};

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
        marks={{ 0.1: <span style={{ whiteSpace: 'nowrap' }}>Min</span>, 5: <span style={{ whiteSpace: 'nowrap' }}>Max</span> }}
        max={5}
        min={0.1}
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
    children: <PetsVolumeControl soundEnabled={soundEnabled} />,
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
      <AuraControl
        disabled={!enablePets}
        auraEnabled={auraEnabled}
        colorValue={general?.petsAuraColor}
        onColorChange={(color) => {
          setSettings({ general: { ...general, petsAuraColor: color } });
        }}
      />
    ),
    desc: 'Activer une traînée lumineuse suivant le pet au déplacement.',
    label: 'Aura',
    minWidth: undefined,
    name: 'petsAura',
    valuePropName: 'checked',
    divider: false,
  };

  const petsAuraOpacityItem = {
    children: <AuraOpacityControl auraEnabled={auraEnabled} />,
    desc: auraEnabled ? 'Réglez l\'opacité globale de la traînée d\'Aura' : 'Activez Aura pour régler l\'opacité',
    label: 'Opacité de l\'Aura',
    minWidth: undefined,
    name: 'petsAuraOpacity',
    divider: false,
  };

  const trailsEnabled = auraEnabled && !!general?.petsAuraDynamicTrails;

  const petsAuraDynamicTrailsItem = {
    children: (
      <DynamicTrailsControl
        auraEnabled={auraEnabled}
        trailsEnabled={trailsEnabled}
        trailStyleValue={general?.petsAuraTrailStyle}
        onTrailStyleChange={(value) => {
          setSettings({ general: { ...general, petsAuraTrailStyle: value } });
        }}
      />
    ),
    desc: auraEnabled ? 'Permet de choisir différents styles de traînées au lieu d\'une simple traînée lumineuse.' : 'Activez Aura pour choisir les traînées',
    label: 'Traînées dynamiques',
    minWidth: undefined,
    name: 'petsAuraDynamicTrails',
    valuePropName: 'checked',
    divider: false,
  };

  const petsAuraMoodItem = {
    children: <AuraMoodControl auraEnabled={auraEnabled} />,
    desc: auraEnabled ? 'Modifie automatiquement la couleur et l\'intensité de l\'Aura selon l\'activité de l\'agent mAI.' : 'Activez Aura pour utiliser cet effet',
    label: 'Effet selon l\'humeur',
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
    label: 'Animations personnalisées',
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
              petsAuraOpacityItem,
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
