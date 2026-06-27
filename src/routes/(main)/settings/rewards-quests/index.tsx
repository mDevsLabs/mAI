import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';

import QuestsList from './features/QuestsList';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.rewardsQuests', { defaultValue: 'Quêtes & Défis' })} />
      <QuestsList />
    </>
  );
};

export default Page;
