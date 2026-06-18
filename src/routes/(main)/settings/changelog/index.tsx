import { useTranslation } from 'react-i18next';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';

import ChangelogContent from './features/ChangelogContent';

const Page = ({ mobile }: { mobile?: boolean }) => {
  const { t } = useTranslation('common');
  return (
    <>
      <SettingHeader title={t('changelog')} />
      <ChangelogContent mobile={mobile} />
    </>
  );
};

export default Page;
