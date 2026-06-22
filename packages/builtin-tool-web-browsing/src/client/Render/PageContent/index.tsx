import type { CrawlPluginState } from '@lobechat/types';
import { Flexbox, ScrollShadow } from '@lobehub/ui';
import { memo } from 'react';

import Loading from './Loading';
import Result from './Result';

interface PagesContentProps {
  messageId: string;
  results?: CrawlPluginState['results'];
  urls?: string[];
}

const PagesContent = memo<PagesContentProps>(({ results, messageId, urls = [] }) => {
  if (!results || results.length === 0) {
    return (
      <Flexbox horizontal gap={8}>
        {urls &&
          urls.length > 0 &&
          urls.map((url, index) => <Loading key={`${url}_${index}`} url={url} />)}
      </Flexbox>
    );
  }

  return (
    <ScrollShadow horizontal gap={8} offset={8} orientation={'horizontal'} size={4}>
      {results.map((result) => (
        <Result
          crawler={result.crawler}
          key={result.originalUrl}
          messageId={messageId}
          originalUrl={result.originalUrl}
          result={result.data!}
        />
      ))}
    </ScrollShadow>
  );
});

export default PagesContent;
