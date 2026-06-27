'use client';

import { type FormGroupItemType } from '@lobehub/ui';
import { Form, Slider } from '@lobehub/ui';
import { Switch } from '@lobehub/ui/base-ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';

const Settings = memo(() => {
  const { t } = useTranslation('setting');

  const soundVolume = useGamificationStore(gamificationSelectors.soundVolume);
  const enableAnimations = useGamificationStore(gamificationSelectors.enableAnimations);
  const setSoundVolume = useGamificationStore((s) => s.setSoundVolume);
  const setEnableAnimations = useGamificationStore((s) => s.setEnableAnimations);

  const gamificationFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <Slider
            max={1}
            min={0}
            step={0.1}
            value={soundVolume}
            onChange={(v: number) => setSoundVolume(v)}
          />
        ),
        desc: t('rewardsSettings.soundVolume.desc', { defaultValue: 'Réglez le volume des effets sonores lors des réclamations et déblocages.' }),
        label: t('rewardsSettings.soundVolume.title', { defaultValue: 'Volume des effets sonores' }),
      },
      {
        children: (
          <Switch
            checked={enableAnimations}
            onChange={(v: boolean) => setEnableAnimations(v)}
          />
        ),
        desc: t('rewardsSettings.enableAnimations.desc', { defaultValue: 'Active ou désactive les effets visuels de confettis et d\'étoiles filantes.' }),
        label: t('rewardsSettings.enableAnimations.title', { defaultValue: 'Animations Premium' }),
      },
    ],
    title: t('rewardsSettings.title', { defaultValue: 'Configuration des récompenses' }),
  };

  const guideFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <div style={{ padding: '8px 16px', lineHeight: '1.6' }}>
            <p><strong>Quêtes Journalières:</strong> Vous recevez 3 quêtes chaque jour (minuit CET). Chacune rapporte 20 XP.</p>
            <p><strong>Quêtes Hebdomadaires:</strong> Vous recevez 5 quêtes chaque semaine (Lundi minuit CET). Le nombre d'XP varie en fonction de la difficulté (50-250 XP).</p>
            <p><strong>Badges:</strong> Certains exploits débloquent des badges. Les badges Mythiques et Ultra ont des animations spéciales.</p>
          </div>
        ),
        label: t('rewardsSettings.guide.title', { defaultValue: 'Guide des quêtes' }),
        minWidth: '100%',
      },
    ],
    title: t('rewardsSettings.guide.header', { defaultValue: 'Guide & Aide' }),
  };

  return (
    <Form
      collapsible={false}
      items={[gamificationFormGroup, guideFormGroup]}
      itemsType={'group'}
      variant={'filled'}
      {...FORM_STYLE}
    />
  );
});

export default Settings;
