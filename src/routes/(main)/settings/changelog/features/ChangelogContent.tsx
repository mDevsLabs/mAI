import { Suspense, memo, useEffect, useState } from 'react';
import { type Components } from 'react-markdown';

import { CustomMDX } from '@/components/mdx';
import CollapsibleSection from '@/components/mdx/CollapsibleSection';
import remarkCollapsibleSections from '@/components/mdx/remarkCollapsibleSections';

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
      <Suspense fallback={<div>Chargement...</div>}>
        <CustomMDX
          components={{ 'collapsible-section': CollapsibleSection } as Components}
          remarkPlugins={[remarkCollapsibleSections]}
          source={formattedChangelog || 'Chargement...'}
        />
      </Suspense>
    </div>
  );
});

export default ChangelogContent;
