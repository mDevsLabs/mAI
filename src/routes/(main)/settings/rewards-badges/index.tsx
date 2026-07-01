import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';

import BadgesList from './features/BadgesList';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.rewardsBadges', { defaultValue: 'Badges' })} />
      <BadgesList />
    </>
  );
};

export default Page;
