import { Markdown } from '@lobehub/ui';
import { memo } from 'react';

import changelogRaw from '../../../../../../CHANGELOG.md?raw';

interface ChangelogContentProps {
  mobile?: boolean;
}

const ChangelogContent = memo<ChangelogContentProps>(({ mobile }) => {
  const formattedChangelog = changelogRaw.replace(/<sup>/g, '*').replace(/<\/sup>/g, '*');
  return (
    <div style={{ padding: mobile ? 16 : 24, userSelect: 'text' }}>
      <Markdown>{formattedChangelog}</Markdown>
    </div>
  );
});

export default ChangelogContent;
