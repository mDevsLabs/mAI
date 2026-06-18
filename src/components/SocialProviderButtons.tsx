'use client';

import { Button, Flexbox, Icon, Text } from '@lobehub/ui';
import { Badge, Divider } from 'antd';
import { type ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';

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
    const [showAll, setShowAll] = useState(false);

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

    const primaryKeys = ['google', 'github', 'x'];
    const primaryProviders = providers.filter((p) => primaryKeys.includes(p.toLowerCase()));
    const otherProviders = providers.filter((p) => !primaryKeys.includes(p.toLowerCase()));

    const renderButton = (provider: string) => {
      const button = (
        <Button
          block
          key={provider}
          loading={socialLoading === provider}
          size="large"
          icon={
            <div
              style={{
                left: 12,
                position: 'absolute',
                top: 13,
              }}
            >
              {AuthIcons(provider, 18)}
            </div>
          }
          onClick={() => onSocialSignIn(provider)}
        >
          {getProviderLabel(provider)}
        </Button>
      );

      const showLastUsed = provider === lastAuthProvider && providers.length > 1;

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
    };

    return (
      <Flexbox gap={12}>
        {primaryProviders.map((provider) => renderButton(provider))}
        
        {showAll && otherProviders.map((provider) => renderButton(provider))}

        {!showAll && otherProviders.length > 0 && (
          <Button block size="large" icon={<MoreHorizontal size={18} />} onClick={() => setShowAll(true)}>
            {t('betterAuth.signin.moreOptions', { defaultValue: 'More options' })}
          </Button>
        )}

        {!hideBottomDivider && divider}
      </Flexbox>
    );
  },
);

SocialProviderButtons.displayName = 'SocialProviderButtons';

export default SocialProviderButtons;
