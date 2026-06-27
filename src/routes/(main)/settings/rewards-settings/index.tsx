import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';

import Settings from './features/Settings';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.rewardsSettings', { defaultValue: 'Configuration Récompenses' })} />
      <Settings />
    </>
  );
};

export default Page;
