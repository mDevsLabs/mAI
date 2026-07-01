'use client';

import { Typography } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import ChangelogContent from '@/components/ChangelogModal/ChangelogContent';
import { changelogKeys } from '@/libs/swr/keys';
import { lambdaClient } from '@/libs/trpc/client';
import type { ChangelogIndexItem } from '@/types/changelog';

import { styles } from './style';

const BlogPage = () => {
  const { t } = useTranslation('common');
  const { data: index } = useSWR(changelogKeys.modalIndex(), () =>
    lambdaClient.changelog.getIndex.query(),
  );

  if (!index || index.length === 0) {
    return (
      <div className={styles.container}>
        <Typography type="secondary">{t('common.noData')}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Typography headerMultiple={0.2}>
        <h1>{t('navigation.blog')}</h1>
      </Typography>
      <ChangelogContent data={index as ChangelogIndexItem[]} />
    </div>
  );
};

import useSWR from 'swr';
import { styles } from './style';

export default BlogPage;