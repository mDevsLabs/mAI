'use client';

import { type FormGroupItemType } from '@lobehub/ui';
import { Accordion, AccordionItem, Flexbox, Form } from '@lobehub/ui';
import { Switch } from '@lobehub/ui/base-ui';
import { confirmModal } from '@lobehub/ui/base-ui';
import { Slider, Select, Button, Typography, App } from 'antd';
import { AlertTriangle, Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';

const { Title, Text } = Typography;

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
];

const Settings = memo(() => {
  const { t } = useTranslation('setting');
  const { message } = App.useApp();

  const soundVolume = useGamificationStore(gamificationSelectors.soundVolume);
  const enableAnimations = useGamificationStore(gamificationSelectors.enableAnimations);
  const enableNotifications = useGamificationStore(gamificationSelectors.enableNotifications);
  const timezone = useGamificationStore(gamificationSelectors.timezone);
  const timezoneLastChanged = useGamificationStore(gamificationSelectors.timezoneLastChanged) || 0;

  const setSoundVolume = useGamificationStore((s) => s.setSoundVolume);
  const setEnableAnimations = useGamificationStore((s) => s.setEnableAnimations);
  const setEnableNotifications = useGamificationStore((s) => s.setEnableNotifications);
  const setTimezone = useGamificationStore((s) => s.setTimezone);
  const resetProgression = useGamificationStore((s) => s.resetProgression);

  const nextAllowedDate = timezoneLastChanged + 365 * 24 * 60 * 60 * 1000;
  const canChangeTimezone = Date.now() > nextAllowedDate;
  const nextChangeFormatted = new Date(nextAllowedDate).toLocaleDateString('fr-FR');

  const handleReset = () => {
    confirmModal({
      cancelText: 'Annuler',
      content: 'Cette action réinitialisera votre niveau à 1, vos points MP à 0 et bloquera à nouveau tous vos badges. Les statistiques d\'action seront également remises à zéro.',
      okButtonProps: {
        danger: true,
        type: 'primary',
      },
      okText: 'Confirmer la réinitialisation',
      onOk: () => {
        resetProgression();
        message.success('Progression réinitialisée avec succès !');
      },
      title: 'Réinitialiser toute la progression ?',
    });
  };

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
        desc: 'Volume des effets sonores lors des succès ou réclamations.',
        label: 'Volume sonore',
      },
      {
        children: (
          <Switch checked={enableAnimations} onChange={(v: boolean) => setEnableAnimations(v)} />
        ),
        desc: 'Active les feux d\'artifice et les confettis visuels.',
        label: 'Animations Premium',
      },
      {
        children: (
          <Switch checked={enableNotifications} onChange={(v: boolean) => setEnableNotifications(v)} />
        ),
        desc: 'Affiche un message lors de la complétion d\'une quête.',
        label: 'Notifications de quêtes',
      },
    ],
    title: 'Général',
  };

  const timezoneFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <Select
            disabled={!canChangeTimezone}
            options={TIMEZONE_OPTIONS}
            style={{ width: 220 }}
            value={timezone}
            onChange={(v: string) => {
              setTimezone(v);
              message.success(`Fuseau horaire configuré sur ${v}`);
            }}
          />
        ),
        desc: canChangeTimezone 
          ? 'Détermine l\'heure de renouvellement de vos quêtes quotidiennes (limité à 1 changement par an).'
          : `Prochain changement possible le ${nextChangeFormatted} (limité à 1 changement par an).`,
        label: 'Fuseau horaire des quêtes',
      },
    ],
    title: 'Fuseau Horaire',
  };

  const dangerFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <Button danger type="primary" onClick={handleReset} icon={<AlertTriangle size={16} />}>
            Réinitialiser ma progression
          </Button>
        ),
        desc: 'Supprime définitivement votre niveau, vos points MP et vos badges de profil.',
        label: 'Remise à zéro',
      },
    ],
    title: 'Zone Danger ⚠️',
  };

  return (
    <Flexbox gap={32} width={'100%'} style={{ paddingBottom: 48 }}>
      <Form
        collapsible={false}
        items={[gamificationFormGroup, timezoneFormGroup, dangerFormGroup]}
        itemsType={'group'}
        variant={'filled'}
        {...FORM_STYLE}
      />

      <Flexbox gap={16} style={{ padding: '0 16px' }}>
        <Title level={4} style={{ margin: 0 }}>FAQ & Aide 💡</Title>
        <Accordion>
          <AccordionItem itemKey="faq-1" title="Comment obtenir des Points MP (mAI Points) ?">
            <div style={{ lineHeight: '1.6', fontSize: 13 }}>
              Les ***MP*** remplacent les anciens points d'expérience (XP). Vous les gagnez en accomplissant des *quêtes quotidiennes* et *hebdomadaires*. Chaque tranche de **100 MP** vous fait monter d'un **Niveau** !
            </div>
          </AccordionItem>
          <AccordionItem itemKey="faq-2" title="Comment les quêtes sont-elles réinitialisées ?">
            <div style={{ lineHeight: '1.6', fontSize: 13 }}>
              Les *quêtes quotidiennes* (3 quêtes actives) se renouvellent tous les jours à **minuit dans votre fuseau horaire choisi**. Les *quêtes hebdomadaires* (5 quêtes actives) se renouvellent tous les **lundis à minuit**.
            </div>
          </AccordionItem>
          <AccordionItem itemKey="faq-3" title="Puis-je changer mon fuseau horaire ?">
            <div style={{ lineHeight: '1.6', fontSize: 13 }}>
              *Oui*, mais pour éviter les abus de réinitialisation des quêtes, vous ne pouvez changer votre fuseau horaire qu'**une seule fois par an**. Choisissez-le donc avec soin !
            </div>
          </AccordionItem>
          <AccordionItem itemKey="faq-4" title="À quoi servent les Badges et comment les afficher ?">
            <div style={{ lineHeight: '1.6', fontSize: 13 }}>
              Les **badges** récompensent vos exploits à long terme. Vous pouvez en obtenir de raretés variées (Rare, Épique, Légendaire, Mythique, Ultra). Vous pouvez en **épingler jusqu'à 5** directement sur votre profil utilisateur.
            </div>
          </AccordionItem>
        </Accordion>
      </Flexbox>
    </Flexbox>
  );
});

export default Settings;
