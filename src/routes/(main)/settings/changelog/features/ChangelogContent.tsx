import { Suspense, memo, useEffect, useState } from 'react';
import { type Components } from 'react-markdown';

import { CustomMDX } from '@/components/mdx';
import CollapsibleSection from '@/components/mdx/CollapsibleSection';
import remarkCollapsibleSections from '@/components/mdx/remarkCollapsibleSections';


interface ChangelogContentProps {
  mobile?: boolean;
}

const ChangelogContent = memo<ChangelogContentProps>(({ mobile }) => {
  const [changelog, setChangelog] = useState<string>('');

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.text();
      })
      .then(text => setChangelog(text))
      .catch(() => setChangelog('Impossible de charger le journal des modifications.'));
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
