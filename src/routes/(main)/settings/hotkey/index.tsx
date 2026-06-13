import { Button, Flexbox } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';
import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import Conversation from './features/Conversation';
import Desktop from './features/Desktop';
import Essential from './features/Essential';

const Page = () => {
  const { t } = useTranslation('setting');
  const [setSettings] = useUserStore((s) => [s.setSettings]);
  const currentHotkeys = useUserStore((s) => settingsSelectors.currentSettings(s).hotkey);

  const hasCustomHotkeys = Object.keys(currentHotkeys || {}).length > 0;

  return (
    <>
      <SettingHeader title={t('tab.hotkey')} />
      <Flexbox align="flex-end" style={{ marginBottom: 16 }}>
        <Button disabled={!hasCustomHotkeys} onClick={() => setSettings({ hotkey: {} })}>
          Réinitialiser par défaut
        </Button>
      </Flexbox>
      {isDesktop && <Desktop />}
      <Essential />
      <Conversation />
    </>
  );
};

export default Page;
