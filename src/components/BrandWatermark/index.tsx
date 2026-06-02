'use client';

import { ORG_NAME, UTM_SOURCE } from '@lobechat/business-const';
import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo } from 'react';

import { isCustomORG } from '@/const/version';

const styles = createStaticStyles(({ css, cssVar }) => ({
  logoLink: css`
    line-height: 1;
    color: inherit;

    &:hover {
      color: ${cssVar.colorLink};
    }
  `,
}));

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      dir={'ltr'}
      flex={'none'}
      gap={4}
      style={{ color: cssVar.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <span>Powered by</span>
      {isCustomORG ? (
        <span>{ORG_NAME}</span>
      ) : (
        <a
          className={styles.logoLink}
          href={`https://github.com/mDevsLabs/mAI`}
          rel="noreferrer"
          target="_blank"
        >
          <span style={{ fontWeight: 'bold', fontSize: 13 }}>mAI</span>
        </a>
      )}
    </Flexbox>
  );
});

export default BrandWatermark;
