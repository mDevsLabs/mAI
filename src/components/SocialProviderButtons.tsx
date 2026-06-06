'use client';

import { Button, Flexbox, Icon, Text } from '@lobehub/ui';
import { Badge, Divider } from 'antd';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AuthIcons from '@/components/AuthIcons';
import AnimatedCollapsed from '@/components/AnimatedCollapsed';

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
    const [expanded, setExpanded] = useState(false);

    if (providers.length === 0) return null;

    const INITIAL_PROVIDERS = ['google', 'github', 'x'];
    const defaultProviders = providers.filter((p) => INITIAL_PROVIDERS.includes(p.toLowerCase()));
    const initialVisible = defaultProviders.length > 0 ? defaultProviders : providers.slice(0, 3);
    const hasMoreProviders = providers.length > initialVisible.length;

    const remainingProviders = providers.filter((p) => !initialVisible.includes(p));

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

    const renderProviderButton = (provider: string) => {
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
    };

    return (
      <Flexbox gap={12}>
        {initialVisible.map(renderProviderButton)}
        
        <AnimatedCollapsed open={expanded}>
          <Flexbox gap={12}>
            {remainingProviders.map(renderProviderButton)}
          </Flexbox>
        </AnimatedCollapsed>

        {hasMoreProviders && !expanded && (
          <Button
            block
            size="large"
            icon={
              <div
                style={{
                  left: 12,
                  position: 'absolute',
                  top: 13,
                }}
              >
                <Icon icon={ChevronDown} />
              </div>
            }
            onClick={() => setExpanded(true)}
          >
            {t('betterAuth.signin.moreProviders', { defaultValue: 'Plus encore' })}
          </Button>
        )}
        {!hideBottomDivider && divider}
      </Flexbox>
    );
  },
);

SocialProviderButtons.displayName = 'SocialProviderButtons';

export default SocialProviderButtons;
