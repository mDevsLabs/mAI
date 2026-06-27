import { Suspense, memo } from 'react';
import { type Components } from 'react-markdown';

import { CustomMDX } from '@/components/mdx';
import CollapsibleSection from '@/components/mdx/CollapsibleSection';
import remarkCollapsibleSections from '@/components/mdx/remarkCollapsibleSections';
import changelogRaw from '../../../../../../CHANGELOG.md?lobe-md-import';


interface ChangelogContentProps {
  mobile?: boolean;
}

const ChangelogContent = memo<ChangelogContentProps>(({ mobile }) => {
  const formattedChangelog = changelogRaw
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
