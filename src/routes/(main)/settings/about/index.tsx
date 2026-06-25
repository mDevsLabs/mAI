import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';

import About from './features/About';
import Analytics from './features/Analytics';
import Gamification from './features/Gamification';

const Page = ({ mobile }: { mobile?: boolean }) => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.about')} />
      <Gamification />
      <About mobile={mobile} />
      <Analytics />
    </>
  );
};

export default Page;
