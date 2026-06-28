'use client';

import { type FormGroupItemType } from '@lobehub/ui';
import { Accordion, AccordionItem, Flexbox, Form, Markdown } from '@lobehub/ui';
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
    title: 'Zone de danger',
  };

  return (
    <Flexbox gap={32} width={'100%'} style={{ paddingBottom: 48 }}>
      <style>{`
        /* Contour autour des boutons d'agrandissement de l'accordéon */
        .ant-collapse-header .ant-collapse-expand-icon,
        .lobe-accordion-item-indicator,
        [class*="AccordionItem"] [class*="indicator"],
        [class*="accordion"] [class*="indicator"] {
          border: 1px solid var(--color-border-secondary) !important;
          border-radius: 6px !important;
          padding: 4px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: var(--color-bg-elevated) !important;
          transition: all 0.2s ease-in-out !important;
        }
        .ant-collapse-header .ant-collapse-expand-icon:hover,
        .lobe-accordion-item-indicator:hover,
        [class*="indicator"]:hover {
          border-color: var(--color-primary) !important;
          background: var(--color-fill-secondary) !important;
        }
      `}</style>
      <Form
        collapsible={false}
        items={[gamificationFormGroup, timezoneFormGroup, dangerFormGroup]}
        itemsType={'group'}
        variant={'filled'}
        {...FORM_STYLE}
      />

      <Flexbox gap={16} style={{ padding: '0 16px' }}>
        <Title level={4} style={{ margin: 0 }}>FAQ & Aide</Title>
        <div style={{
          border: '1px solid var(--color-border-secondary)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--color-bg-container)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
        }}>
          <Accordion defaultExpandedKeys={[]}>
            <AccordionItem itemKey="faq-1" title="Comment obtenir des Points MP (mAI Points) ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Les ***MP*** (mAI Points) se gagnent en réalisant des actions quotidiennes dans l'application. Chaque message envoyé, outil ou plugin utilisé, ou agent spécialisé créé vous rapporte des points de base. Les **Quêtes quotidiennes** et **Quêtes hebdomadaires** sont les moyens les plus efficaces pour accumuler de grandes quantités de ***MP*** rapidement !`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-2" title="Comment fonctionne le système de Niveaux et combien de MP faut-il ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Chaque niveau requiert exactement **200 MP** pour être franchi. Lorsque vous accumulez des points, votre barre de progression se remplit automatiquement. Une fois les **200 MP** atteints, vous passez au **Niveau supérieur** 🚀 ! Il n'y a pas de limite au niveau que vous pouvez atteindre.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-3" title="Quelles sont les différentes raretés de Badges et leurs proportions ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Les badges sont répartis selon 5 niveaux de rareté bien distincts :
- **Rare** (50% des badges) : Faciles à débloquer au fil de l'utilisation.
- **Épique** (30% des badges) : Demandent un engagement plus régulier.
- **Légendaire** (10% des badges) : Nécessitent des efforts à long terme.
- **Mythique** (7% des badges) : Réservés aux utilisateurs chevronnés, possèdent des animations spéciales.
- **Ultra** (3% des badges) : Les plus prestigieux du système avec des effets visuels uniques.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-4" title="Comment épingler des Badges sur mon profil et combien puis-je en afficher ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Vous pouvez épingler jusqu'à **5 badges** simultanément sur votre profil public. Pour cela, cliquez sur un badge débloqué dans votre collection ("Badges & Titres"), puis cliquez sur le bouton **"Épingler au profil"**. Vous pouvez les désépingler à tout moment de la même manière.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-5" title="Quand les quêtes quotidiennes et hebdomadaires changent-elles ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`- Les **Quêtes quotidiennes** (3 quêtes actives) sont renouvelées toutes les nuits à **minuit (00:00)** selon le fuseau horaire choisi dans vos Paramètres.
- Les **Quêtes hebdomadaires** (5 quêtes actives) sont renouvelées tous les **lundis à minuit (00:00)**.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-6" title="Comment fonctionne la limitation du fuseau horaire des quêtes ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Vous pouvez configurer votre fuseau horaire préféré afin que les quêtes s'adaptent à vos horaires de vie. Pour éviter toute triche ou réinitialisation abusive, ce réglage est strictement limité à **1 modification par an**. Une fois modifié, le menu de sélection restera grisé pendant 365 jours.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-7" title="Qu'est-ce que la Zone de danger et comment fonctionne la réinitialisation ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`La section **Zone de danger** contient l'option de remise à zéro totale de votre progression. En confirmant cette action, vos **MP** retournent à \`0\`, votre **Niveau** repasse à \`1\`, et tous vos badges ainsi que l'historique de vos actions sont définitivement effacés. Utilisez cette action avec *extrême précaution*.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-8" title="Comment récupérer des quêtes quotidiennes supplémentaires ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Si vous avez terminé vos quêtes du jour mais souhaitez continuer à progresser, vous pouvez utiliser le bouton **"Obtenir 3 quêtes quotidiennes supplémentaires"** (limité à *3 fois par jour*). Si vous tentez de dépasser cette limite quotidienne, un **message d'erreur explicite** s'affichera pour vous en avertir.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-9" title="Y a-t-il des effets sonores et visuels particuliers dans mAI ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`*Absolument !* Chaque fois que vous validez une quête ou débloquez un badge, un son festif est joué et des confettis s'affichent à l'écran. Vous pouvez régler le **volume de ces effets** ou **désactiver les animations** à tout moment dans les Paramètres des récompenses.`}
                </Markdown>
              </div>
            </AccordionItem>
            <AccordionItem itemKey="faq-10" title="Où puis-je suivre l'historique complet de mes exploits ?">
              <div style={{ padding: '8px 16px 16px' }}>
                <Markdown>
                  {`Votre page **Niveau** vous offre une vue d'ensemble de vos statistiques : le total cumulé de vos points ***MP***, le nombre d'actions effectuées depuis votre inscription et le nombre total de badges uniques débloqués. C'est votre *tableau de bord personnel* de réussite !`}
                </Markdown>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </Flexbox>
    </Flexbox>
  );
});

export default Settings;
