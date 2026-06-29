'use client';

import { type FormGroupItemType } from '@lobehub/ui';
import { Flexbox, Form, Markdown } from '@lobehub/ui';
import { Switch } from '@lobehub/ui/base-ui';
import { confirmModal } from '@lobehub/ui/base-ui';
import { Slider, Select, Button, Typography, App } from 'antd';
import { AlertTriangle, Globe, Sliders, HelpCircle } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGamificationStore } from '@/store/gamification';
import { gamificationSelectors } from '@/store/gamification/selectors';

const { Title, Text } = Typography;

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'UTC', label: 'UTC (GMT)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT)' }
];

const TIMEZONE_DESCRIPTIONS: Record<string, string> = {
  'Europe/Paris': 'CET/CEST = France, Espagne, Italie, Allemagne, Belgique, Pays-Bas, Suisse...',
  'UTC': 'Coordinated Universal Time = Royaume-Uni (hiver), Islande, pays d\'Afrique de l\'Ouest...',
  'America/New_York': 'EST/EDT = États-Unis (Est), Canada (Est), Bahamas, Colombie...',
  'America/Los_Angeles': 'PST/PDT = États-Unis (Pacifique), Canada (Pacifique), Mexique (Nord)...',
  'Asia/Tokyo': 'JST = Japon, Corée du Sud, Indonésie (Est)...',
  'Asia/Shanghai': 'CST = Chine, Taïwan, Singapour, Malaisie...',
  'Europe/London': 'GMT/BST = Royaume-Uni, Irlande, Portugal...',
  'Australia/Sydney': 'AEST/AEDT = Australie (Est/Sud-Est)...',
  'Asia/Dubai': 'GST = Émirats Arabes Unis, Oman, Géorgie...',
  'America/Sao_Paulo': 'BRT/BRST = Brésil (Sud/Sud-Est)...'
};

const FAQ_CONTENT = `Bienvenue dans le guide officiel du système de progression et de récompenses de **mAI**. Cette section réunit toutes les règles et explications essentielles pour comprendre et maximiser vos performances.

### 📊 Fonctionnement des Niveaux et MP (mAI Points)
- Les **MP (mAI Points)** représentent la mesure de votre activité globale dans l'écosystème.
- Chaque niveau nécessite précisément **200 MP** pour être franchi, sans aucune limite maximale de niveau.
- Vous gagnez des points en discutant avec vos compagnons, en créant des agents ou en exploitant des plugins.

### 📅 Cycle des Quêtes et Défis Actifs
- Les **quêtes quotidiennes** (3 actives) sont réinitialisées automatiquement chaque jour à **minuit (00:00)**.
- Les **quêtes hebdomadaires** (5 actives) se renouvellent chaque **lundi à minuit** pour offrir de nouveaux défis.
- Un bonus exceptionnel de **3 quêtes quotidiennes supplémentaires** est disponible **une fois par semaine** (7 jours de recharge).
- Si vous tentez de réclamer ce bonus avant l'expiration du délai, un **message d'erreur explicite** s'affichera.

### 🏆 Raretés des Badges et Épinglage
- Votre collection comprend **100 badges uniques** classés selon 5 raretés distinctes avec leurs couleurs associées.
- Répartition des raretés : *Rare* (50%), *Épique* (30%), *Légendaire* (10%), *Mythique* (7%), et *Ultra* (3%).
- Les badges se débloquent automatiquement en arrière-plan lorsque vous atteignez le nombre d'actions requises.
- Vous pouvez personnaliser votre profil en épinglant un maximum de **5 badges** simultanément dans votre vitrine.

### 🌍 Paramètres Horaires et Réinitialisation
- Le **fuseau horaire des quêtes** configure le moment précis de réinitialisation de vos défis quotidiens.
- Pour éviter les abus de double-validation, le changement de fuseau horaire est limité à **1 fois par an**.
- La **Zone de danger** vous permet de réinitialiser l'intégralité de vos statistiques, niveaux, badges et MP.
- *Attention* : La réinitialisation est instantanée et **strictement irréversible** ; vos données seront perdues à jamais.

### 🎁 Récompenses de Niveau à Télécharger
- En progressant, vous débloquez l'accès à des fichiers de récompenses exclusives mAI créés par nos designers.
- Les paliers **Niveau 10, 20, 30, 40 et 50** vous accordent le téléchargement de **fonds d'écran mAI** uniques.
- Le palier mythique du **Niveau 100** libère le pack ultime contenant les **logos spéciaux mAI** en haute définition.`;

const Settings = memo(() => {
  const { t } = useTranslation('setting');
  const { message } = App.useApp();

  const enableAnimations = useGamificationStore(gamificationSelectors.enableAnimations);
  const soundVolume = useGamificationStore(gamificationSelectors.soundVolume);
  const timezone = useGamificationStore(gamificationSelectors.timezone);
  const timezoneLastChanged = useGamificationStore(gamificationSelectors.timezoneLastChanged);
  const enableNotifications = useGamificationStore((s) => s.enableNotifications ?? true);

  const setEnableAnimations = useGamificationStore((s) => s.setEnableAnimations);
  const setSoundVolume = useGamificationStore((s) => s.setSoundVolume);
  const setTimezone = useGamificationStore((s) => s.setTimezone);
  const setEnableNotifications = useGamificationStore((s) => s.setEnableNotifications);
  const resetProgression = useGamificationStore((s) => s.resetProgression);

  const canChangeTimezone = !timezoneLastChanged || (Date.now() - timezoneLastChanged > 365 * 24 * 60 * 60 * 1000);
  const nextChangeDate = new Date((timezoneLastChanged || 0) + 365 * 24 * 60 * 60 * 1000);
  const nextChangeFormatted = nextChangeDate.toLocaleDateString();

  const handleReset = () => {
    confirmModal({
      title: 'Réinitialiser toute la progression ?',
      content: 'Cette action est irréversible. Vous perdrez tous vos points MP, votre niveau actuel ainsi que vos badges débloqués.',
      okText: 'Confirmer la réinitialisation',
      cancelText: 'Annuler',
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () => {
        resetProgression();
        message.success('Progression réinitialisée avec succès.');
      }
    });
  };

  const gamificationFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <Slider 
            min={0} 
            max={100} 
            value={soundVolume * 100} 
            onChange={(v: number) => setSoundVolume(v / 100)} 
            style={{ width: 150 }}
          />
        ),
        desc: 'Ajuste le volume des effets sonores de réussite.',
        label: 'Volume des effets sonores',
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
    icon: Sliders,
    collapsible: false,
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
        desc: (
          <Flexbox gap={4}>
            <div>{canChangeTimezone 
              ? 'Détermine l\'heure de renouvellement de vos quêtes quotidiennes (limité à 1 changement par an).'
              : `Prochain changement possible le ${nextChangeFormatted} (limité à 1 changement par an).`}</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: '600', marginTop: 4 }}>
              {TIMEZONE_DESCRIPTIONS[timezone] || ''}
            </div>
          </Flexbox>
        ),
        label: 'Fuseau horaire des quêtes',
      },
    ],
    title: 'Fuseau Horaire',
    icon: Globe,
    collapsible: false,
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
    title: 'Zone de danger',
    icon: AlertTriangle,
    collapsible: false,
  };

  const faqFormGroup: FormGroupItemType = {
    children: [
      {
        children: (
          <div style={{ width: '100%', padding: '4px 8px' }}>
            <Markdown>{FAQ_CONTENT}</Markdown>
          </div>
        ),
      }
    ],
    title: 'FAQ & Aide',
    icon: HelpCircle,
    collapsible: false,
  };

  return (
    <Flexbox gap={32} width={'100%'} style={{ paddingBottom: 48 }}>
      <style>{`
        /* Supprime définitivement l'icône / flèche de pliage (bouton chevron ⬇) à gauche des titres de section */
        .ant-collapse-expand-icon,
        .ant-collapse-arrow,
        [class*="Collapse"] [class*="indicator"],
        [class*="Collapse"] [class*="arrow"],
        [class*="collapse"] [class*="indicator"],
        [class*="collapse"] [class*="arrow"] {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Supprime les marges négatives ou décalages causés par la suppression du chevron */
        .ant-collapse-header {
          padding-left: 12px !important;
        }
      `}</style>
      <Form
        collapsible={false}
        items={[gamificationFormGroup, timezoneFormGroup, faqFormGroup, dangerFormGroup]}
        itemsType={'group'}
        variant={'filled'}
        {...FORM_STYLE}
      />
    </Flexbox>
  );
});

export default Settings;
