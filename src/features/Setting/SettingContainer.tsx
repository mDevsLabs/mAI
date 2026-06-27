'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { FloatButton } from 'antd';
import { type PropsWithChildren, type ReactNode } from 'react';
import { memo } from 'react';

interface SettingContainerProps extends FlexboxProps {
  addonAfter?: ReactNode;
  addonBefore?: ReactNode;
  maxWidth?: number | string;
  variant?: 'default' | 'secondary';
}
const SettingContainer = memo<PropsWithChildren<SettingContainerProps>>(
  ({ variant, maxWidth = 1024, children, addonAfter, addonBefore, style, ...rest }) => {
    const theme = useTheme(); // Keep for colorBgContainerSecondary (not in cssVar)
    return (
      <Flexbox
        align={'center'}
        height={'100%'}
        id={'lobe-setting-container'}
        width={'100%'}
        style={{
          background:
            variant === 'secondary' ? theme.colorBgContainerSecondary : cssVar.colorBgContainer,
          overflowX: 'hidden',
          overflowY: 'auto',
          ...style,
        }}
        {...rest}
      >
        {addonBefore}
        <Flexbox
          flex={1}
          gap={36}
          width={'100%'}
          style={{
            maxWidth,
          }}
        >
          {children}
        </Flexbox>
        {addonAfter}
        <FloatButton.BackTop target={() => document.getElementById('lobe-setting-container') as HTMLElement} />
      </Flexbox>
    );
  },
);

export default SettingContainer;
