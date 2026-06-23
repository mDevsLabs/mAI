import { Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import changelogRaw from '../../../../../../CHANGELOG.md?raw';

interface ChangelogContentProps {
  mobile?: boolean;
}

const ChangelogContent = memo<ChangelogContentProps>(({ mobile }) => {
  const { t } = useTranslation('common');
  const formattedChangelog = changelogRaw
    .replace(/^<a name="readme-top"><\/a>\n*/, '')
    .replace(/^# Changelog/m, '')
    .replace(/<sup>/g, '*')
    .replace(/<\/sup>/g, '*');

  return (
    <div style={{ padding: mobile ? 16 : 24, userSelect: 'text' }}>
      <Markdown allowHtml variant={'default'}>
        {formattedChangelog}
      </Markdown>
    </div>
  );
});

export default ChangelogContent;
