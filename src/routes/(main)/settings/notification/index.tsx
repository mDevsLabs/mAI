'use client';

import { Form, SliderWithInput } from '@lobehub/ui';
import { App, Button, ColorPicker, Switch } from 'antd';
import { AlertCircle, Bell, CheckCircle, Globe, Info, Palette, Send, Volume2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useNotificationStore } from '@/store/notification';

const NotificationSettingsPage = memo(() => {
  const { settings, updateSettings, updateSounds, addNotification } = useNotificationStore();
  const { message } = App.useApp();
  const { t } = useTranslation('setting');

  const requestNotificationPermission = async (checked: boolean) => {
    if (!checked) {
      updateSettings({ webPush: false });
      return;
    }

    if (!('Notification' in window)) {
      message.error('Votre navigateur ne supporte pas les notifications Web.');
      return;
    }

    if (Notification.permission === 'granted') {
      updateSettings({ webPush: true });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ webPush: true });
      } else {
        message.warning('Permission refusée pour les notifications Web.');
        updateSettings({ webPush: false });
      }
    } else {
      message.error('Les notifications sont bloquées par votre navigateur.');
      updateSettings({ webPush: false });
    }
  };

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.recommendations !== undefined)
      updateSettings({ recommendations: changedValues.recommendations });
    if (changedValues.news !== undefined) updateSettings({ news: changedValues.news });
    if (changedValues.volume !== undefined) updateSettings({ volume: changedValues.volume });

    if (changedValues.soundInfo !== undefined) updateSounds({ info: changedValues.soundInfo });
    if (changedValues.soundSuccess !== undefined)
      updateSounds({ success: changedValues.soundSuccess });
    if (changedValues.soundError !== undefined) updateSounds({ error: changedValues.soundError });

    if (changedValues.colorInfo !== undefined)
      updateSettings({
        colors: {
          ...settings.colors,
          info:
            typeof changedValues.colorInfo === 'string'
              ? changedValues.colorInfo
              : changedValues.colorInfo.toHexString(),
        },
      });
    if (changedValues.colorSuccess !== undefined)
      updateSettings({
        colors: {
          ...settings.colors,
          success:
            typeof changedValues.colorSuccess === 'string'
              ? changedValues.colorSuccess
              : changedValues.colorSuccess.toHexString(),
        },
      });
    if (changedValues.colorError !== undefined)
      updateSettings({
        colors: {
          ...settings.colors,
          error:
            typeof changedValues.colorError === 'string'
              ? changedValues.colorError
              : changedValues.colorError.toHexString(),
        },
      });
  };

  return (
    <>
      <SettingHeader title={t('tab.notification')} />
      <Form
        collapsible={false}
        itemsType={'group'}
        variant={'filled'}
        initialValues={{
          recommendations: settings.recommendations,
          news: settings.news,
          webPush: settings.webPush,
          volume: settings.volume,
          soundInfo: settings.sounds.info,
          soundSuccess: settings.sounds.success,
          soundError: settings.sounds.error,
          colorInfo: settings.colors.info,
          colorSuccess: settings.colors.success,
          colorError: settings.colors.error,
        }}
        items={[
          {
            children: [
              {
                children: (
                  <Button
                    icon={<Send size={16} />}
                    onClick={() => {
                      addNotification({
                        type: 'info',
                        title: 'Test',
                        content: 'Ceci est une notification de test réussie !',
                      });
                    }}
                  >
                    Envoyer
                  </Button>
                ),
                desc: 'Vérifier le comportement visuel et sonore (ainsi que Web Push si activé)',
                label: 'Notification de Test',
              },
              {
                children: <Switch onChange={requestNotificationPermission} />,
                desc: t('settingNotification.general.webPush.desc'),
                label: t('settingNotification.general.webPush.title'),
                name: 'webPush',
                valuePropName: 'checked',
                icon: Globe,
              },
              {
                children: <Switch />,
                desc: t('settingNotification.general.recommendations.desc'),
                label: t('settingNotification.general.recommendations.title'),
                name: 'recommendations',
                valuePropName: 'checked',
              },
              {
                children: <Switch />,
                desc: t('settingNotification.general.news.desc'),
                label: t('settingNotification.general.news.title'),
                name: 'news',
                valuePropName: 'checked',
              },
            ],
            title: t('settingNotification.general.title'),
            icon: Bell,
          },
          {
            children: [
              {
                children: <Switch />,
                desc: t('settingNotification.sounds.info.desc'),
                label: t('settingNotification.sounds.info.title'),
                name: 'soundInfo',
                valuePropName: 'checked',
                icon: Info,
              },
              {
                children: <Switch />,
                desc: t('settingNotification.sounds.success.desc'),
                label: t('settingNotification.sounds.success.title'),
                name: 'soundSuccess',
                valuePropName: 'checked',
                icon: CheckCircle,
              },
              {
                children: <Switch />,
                desc: t('settingNotification.sounds.error.desc'),
                label: t('settingNotification.sounds.error.title'),
                name: 'soundError',
                valuePropName: 'checked',
                icon: AlertCircle,
              },
              {
                children: <SliderWithInput max={100} min={0} />,
                desc: t('settingNotification.sounds.volume.desc'),
                label: t('settingNotification.sounds.volume.title'),
                name: 'volume',
              },
            ],
            title: t('settingNotification.sounds.title'),
            icon: Volume2,
          },
          {
            title: 'Apparence',
            icon: Palette,
            children: [
              {
                children: <ColorPicker showText />,
                desc: 'Couleur de la pastille pour les informations',
                label: 'Couleur Information',
                name: 'colorInfo',
              },
              {
                children: <ColorPicker showText />,
                desc: 'Couleur de la pastille pour les succès',
                label: 'Couleur Succès',
                name: 'colorSuccess',
              },
              {
                children: <ColorPicker showText />,
                desc: 'Couleur de la pastille pour les erreurs',
                label: 'Couleur Erreur',
                name: 'colorError',
              },
            ],
          },
        ]}
        onValuesChange={handleValuesChange}
        {...FORM_STYLE}
      />
    </>
  );
});

export default NotificationSettingsPage;
