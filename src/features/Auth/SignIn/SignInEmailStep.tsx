import { BRANDING_NAME } from '@lobechat/business-const';
import { Alert, Button, Flexbox, Icon, Input, Skeleton, Text } from '@lobehub/ui';
import { type FormInstance, type InputRef } from 'antd';
import { Badge, Divider, Form } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ChevronRight, Mail } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AuthIcons from '@/components/AuthIcons';
import AuthCard from '@/features/AuthCard';
import { AuthAgreement } from '@/features/AuthShell';

const styles = createStaticStyles(({ css, cssVar }) => ({
  setPasswordLink: css`
    cursor: pointer;
    color: ${cssVar.colorPrimary};
    text-decoration: underline;
  `,
  socialButtonsContainer: css`
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${cssVar.colorTextQuaternary};
      border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: ${cssVar.colorTextTertiary};
    }
  `,
}));

export const EMAIL_REGEX = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
export const USERNAME_REGEX = /^\w+$/;

// Pin both the provider logo and the loading spinner to the same spot so the
// spinner doesn't jump when a social button enters its loading state.
const PROVIDER_ICON_STYLE: CSSProperties = { left: 12, position: 'absolute', top: 13 };

// Turn a provider id into a display name, e.g. "google" -> "Google".
const getProviderName = (provider: string) =>
  provider.toLowerCase().replaceAll(/(^|[_-])([a-z])/g, (_, __, c) => c.toUpperCase());

export interface SignInEmailStepProps {
  disableEmailPassword?: boolean;
  form: FormInstance<{ email: string }>;
  isSocialOnly: boolean;
  lastAuthProvider?: string | null;
  loading: boolean;
  oAuthSSOProviders: string[];
  onCheckUser: (values: { email: string }) => Promise<void>;
  onSetPassword: () => void;
  onSocialSignIn: (provider: string) => void;
  serverConfigInit: boolean;
  socialLoading: string | null;
}

export const SignInEmailStep = ({
  disableEmailPassword,
  form,
  isSocialOnly,
  lastAuthProvider,
  loading,
  oAuthSSOProviders,
  serverConfigInit,
  socialLoading,
  onCheckUser,
  onSetPassword,
  onSocialSignIn,
}: SignInEmailStepProps) => {
  const { t } = useTranslation('auth');
  const emailInputRef = useRef<InputRef>(null);
  const [showAllProviders, setShowAllProviders] = useState(false);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const divider = (
    <Divider>
      <Text fontSize={12} type={'secondary'}>
        {t('betterAuth.signin.orContinueWith')}
      </Text>
    </Divider>
  );

  const getProviderLabel = (provider: string) => {
    const normalized = getProviderName(provider);
    const normalizedKey = normalized.replaceAll(/[^\da-z]/gi, '');
    const key = `betterAuth.signin.continueWith${normalizedKey}`;
    return t(key, { defaultValue: `Continue with ${normalized}` });
  };

  const hasMoreProviders = oAuthSSOProviders.length > 3;
  const visibleProviders = hasMoreProviders && !showAllProviders
    ? oAuthSSOProviders.slice(0, 3)
    : oAuthSSOProviders;

  return (
    <AuthCard
      title={t('betterAuth.signin.emailStep.title')}
      subtitle={t('signin.subtitle', { appName: BRANDING_NAME })}
    >
      {!serverConfigInit && (
        <Flexbox gap={12}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
          {divider}
        </Flexbox>
      )}
      {serverConfigInit && oAuthSSOProviders.length > 0 && (
        <Flexbox gap={12}>
          <div className={styles.socialButtonsContainer}>
            {visibleProviders.map((provider) => {
              const button = (
                <Button
                  block
                  icon={
                    <span style={PROVIDER_ICON_STYLE}>
                      {AuthIcons(provider, 18)}
                    </span>
                  }
                  key={provider}
                  loading={socialLoading === provider}
                  size="large"
                  onClick={() => onSocialSignIn(provider)}
                >
                  {getProviderLabel(provider)}
                </Button>
              );
              const showLastUsed =
                provider === lastAuthProvider &&
                (oAuthSSOProviders.length > 1 ||
                  (oAuthSSOProviders.length === 1 && !disableEmailPassword));
              return showLastUsed ? (
                <Badge
                  color="var(--ant-color-info)"
                  count={t('betterAuth.signin.lastUsed')}
                  key={provider}
                  styles={{ root: { display: 'block', width: '100%' } }}
                >
                  {button}
                </Badge>
              ) : (
                button
              );
            })}
          </div>
          {hasMoreProviders && !showAllProviders && (
            <Button
              block
              size="large"
              onClick={() => setShowAllProviders(true)}
            >
              ... {t('betterAuth.signin.moreOptions')}
            </Button>
          )}
          {!disableEmailPassword && divider}
        </Flexbox>
      )}
      {serverConfigInit && disableEmailPassword && oAuthSSOProviders.length === 0 && (
        <Alert showIcon description={t('betterAuth.signin.ssoOnlyNoProviders')} type="warning" />
      )}
      {!disableEmailPassword && (
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => onCheckUser(values as { email: string })}
        >
          <Form.Item
            name="email"
            style={{ marginBottom: 0 }}
            rules={[
              { message: t('betterAuth.errors.emailRequired'), required: true },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const trimmedValue = (value as string).trim();
                  if (EMAIL_REGEX.test(trimmedValue) || USERNAME_REGEX.test(trimmedValue)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('betterAuth.errors.emailInvalid')));
                },
              },
            ]}
          >
            <Input
              placeholder={t('betterAuth.signin.emailPlaceholder')}
              ref={emailInputRef}
              size="large"
              prefix={
                <Icon
                  icon={Mail}
                  style={{
                    marginInline: 6,
                  }}
                />
              }
              style={{
                padding: 6,
              }}
              suffix={
                <Button
                  icon={ChevronRight}
                  loading={loading}
                  title={t('betterAuth.signin.nextStep')}
                  variant={'filled'}
                  onClick={() => form.submit()}
                />
              }
            />
          </Form.Item>
        </Form>
      )}
      {isSocialOnly && (
        <Alert
          showIcon
          style={{ marginTop: 12 }}
          type="info"
          description={
            <>
              {t('betterAuth.signin.socialOnlyHint')}{' '}
              <a className={styles.setPasswordLink} onClick={onSetPassword}>
                {t('betterAuth.signin.setPassword')}
              </a>
            </>
          }
        />
      )}
      <AuthAgreement />
    </AuthCard>
  );
};
