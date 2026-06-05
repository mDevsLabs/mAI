'use client';

import { Button, Flexbox, Icon, Text } from '@lobehub/ui';
import { Badge, Divider } from 'antd';
import { type ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import AuthIcons from '@/components/AuthIcons';

export interface SocialProviderButtonsProps {
  /**
   * Text to show in the divider between social buttons and the rest of the form.
   * If not provided, defaults to the signin.orContinueWith i18n key.
   */
  dividerText?: ReactNode;
  /**
   * Whether the email/password section is disabled (SSO only mode).
   * When true, no divider is shown below the social buttons.
   */
  hideBottomDivider?: boolean;
  /**
   * Provider ID that was last used for authentication.
   * Shows a "Last used" badge on that provider button.
   */
  lastAuthProvider?: string | null;
  /**
   * Callback fired when a social provider button is clicked.
   */
  onSocialSignIn: (provider: string) => void;
  /**
   * List of OAuth/SSO provider IDs to display buttons for.
   */
  providers: string[];
  /**
   * Provider ID currently loading (shows a spinner on that button).
   */
  socialLoading: string | null;
}

const SocialProviderButtons = memo<SocialProviderButtonsProps>(
  ({
    providers,
    socialLoading,
    lastAuthProvider,
    onSocialSignIn,
    hideBottomDivider = false,
    dividerText,
  }) => {
    const { t } = useTranslation('auth');

    if (providers.length === 0) return null;

    const getProviderLabel = (provider: string) => {
      const normalized = provider
        .toLowerCase()
        .replaceAll(/(^|[_-])([a-z])/g, (_, __, c) => c.toUpperCase());
      const normalizedKey = normalized.replaceAll(/[^\da-z]/gi, '');
      const key = `betterAuth.signin.continueWith${normalizedKey}`;
      return t(key, { defaultValue: `Continue with ${normalized}` });
    };

    const divider = (
      <Divider>
        <Text fontSize={12} type={'secondary'}>
          {dividerText ?? t('betterAuth.signin.orContinueWith')}
        </Text>
      </Divider>
    );

    return (
      <Flexbox gap={12}>
        {providers.map((provider) => {
          const button = (
            <Button
              block
              key={provider}
              loading={socialLoading === provider}
              size="large"
              onClick={() => onSocialSignIn(provider)}
            >
              <div
                style={{
                  left: 12,
                  position: 'absolute',
                  top: 13,
                }}
              >
                {AuthIcons(provider, 18)}
              </div>
              {getProviderLabel(provider)}
            </Button>
          );

          const showLastUsed =
            provider === lastAuthProvider && providers.length > 1;

          return showLastUsed ? (
            <Badge.Ribbon
              color="var(--ant-color-info-fill-tertiary)"
              key={provider}
              styles={{ content: { color: 'var(--ant-color-info)' } }}
              text={t('betterAuth.signin.lastUsed')}
            >
              {button}
            </Badge.Ribbon>
          ) : (
            button
          );
        })}
        {!hideBottomDivider && divider}
      </Flexbox>
    );
  },
);

SocialProviderButtons.displayName = 'SocialProviderButtons';

export default SocialProviderButtons;
