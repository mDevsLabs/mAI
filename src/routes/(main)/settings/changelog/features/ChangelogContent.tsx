import { Markdown } from '@lobehub/ui';
import { memo, useEffect, useState } from 'react';

import changelogRaw from '../../../../../../CHANGELOG.md?raw';

interface ChangelogContentProps {
  mobile?: boolean;
}

const ChangelogContent = memo<ChangelogContentProps>(({ mobile }) => {
  const [changelog, setChangelog] = useState<string>('');

  useEffect(() => {
    let raw = typeof changelogRaw === 'string' ? changelogRaw : (changelogRaw as any)?.default || '';
    if (raw) {
      setChangelog(raw);
    } else {
      fetch('https://raw.githubusercontent.com/mDevsLabs/mAI/main/CHANGELOG.md')
        .then(res => res.text())
        .then(text => setChangelog(text))
        .catch(() => setChangelog('Impossible de charger le journal des modifications.'));
    }
  }, []);

  const formattedChangelog = changelog
    .replace(/^<a name="readme-top"><\/a>\n*/, '')
    .replace(/^# Changelog/m, '')
    .replace(/<sup>/g, '*')
    .replace(/<\/sup>/g, '*');

  return (
    <div style={{ padding: mobile ? 16 : 24, userSelect: 'text' }}>
      <Markdown allowHtml variant={'default'}>
        {formattedChangelog || 'Chargement...'}
      </Markdown>
    </div>
  );
});

export default ChangelogContent;
