'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox, Text } from '@lobehub/ui';
import { type ReactNode } from 'react';
import { memo } from 'react';

export interface AuthCardProps extends Omit<FlexboxProps, 'title'> {
  footer?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
}

import { createStaticStyles } from 'antd-style';

const styles = createStaticStyles(({ css }) => ({
  authCard: css`
    padding: 24px;
    border-radius: 16px;
    background: var(--ant-color-bg-container);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);

    @media (max-width: 576px) {
      padding: 16px;
      box-shadow: none;
      background: transparent;
    }
  `,
}));

export const AuthCard = memo<AuthCardProps>(({ children, title, subtitle, footer, className, ...rest }) => {
  return (
    <Flexbox className={[styles.authCard, className].filter(Boolean).join(' ')} width={'min(100%,440px)'} {...rest}>
      <Flexbox gap={12}>
        {title && (
          <Text fontSize={28} style={{ lineHeight: 1.2, letterSpacing: '-0.02em' }} weight={'bold'}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text fontSize={16} style={{ lineHeight: 1.4 }} type={'secondary'} weight={500}>
            {subtitle}
          </Text>
        )}
      </Flexbox>
      <Flexbox gap={8} paddingBlock={28}>
        {children}
      </Flexbox>
      {footer}
    </Flexbox>
  );
});

export default AuthCard;
