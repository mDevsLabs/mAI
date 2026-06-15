import { BRANDING_NAME } from '@lobechat/business-const';
import { Alert, Button, Flexbox, Icon, Input, Skeleton, Text } from '@lobehub/ui';
import { type FormInstance, type InputRef } from 'antd';
import { Divider, Form } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ChevronRight, Mail } from 'lucide-react';
import { type CSSProperties, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

<<<<<<< HEAD:src/app/[variants]/(auth)/signin/SignInEmailStep.tsx
import SocialProviderButtons from '@/components/SocialProviderButtons';
import { PRIVACY_URL, TERMS_URL } from '@/const/url';

import AuthCard from '../../../../features/AuthCard';
=======
import AuthIcons from '@/components/AuthIcons';
import AuthCard from '@/features/AuthCard';
import { AuthAgreement } from '@/features/AuthShell';
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignIn/SignInEmailStep.tsx

const styles = createStaticStyles(({ css, cssVar }) => ({
  setPasswordLink: css`
    cursor: pointer;
    color: ${cssVar.colorPrimary};
    text-decoration: underline;
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

<<<<<<< HEAD:src/app/[variants]/(auth)/signin/SignInEmailStep.tsx

=======
  const getProviderLabel = (provider: string) => {
    const normalized = getProviderName(provider);
    const normalizedKey = normalized.replaceAll(/[^\da-z]/gi, '');
    const key = `betterAuth.signin.continueWith${normalizedKey}`;
    return t(key, { defaultValue: `Continue with ${normalized}` });
  };
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignIn/SignInEmailStep.tsx

  return (
<<<<<<< HEAD:src/app/[variants]/(auth)/signin/SignInEmailStep.tsx
    <AuthCard
      footer={footer}
      subtitle={t('signin.subtitle', { appName: BRANDING_NAME })}
      title={t('betterAuth.signin.emailStep.title')}
    >
=======
    <AuthCard title={t('signin.subtitle', { appName: BRANDING_NAME })}>
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignIn/SignInEmailStep.tsx
      {!serverConfigInit && (
        <Flexbox gap={12}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
          {divider}
        </Flexbox>
      )}
      {serverConfigInit && oAuthSSOProviders.length > 0 && (
<<<<<<< HEAD:src/app/[variants]/(auth)/signin/SignInEmailStep.tsx
        <SocialProviderButtons
          hideBottomDivider={disableEmailPassword}
          lastAuthProvider={lastAuthProvider}
          onSocialSignIn={onSocialSignIn}
          providers={oAuthSSOProviders}
          socialLoading={socialLoading}
        />
=======
        <Flexbox gap={12}>
          {oAuthSSOProviders.map((provider) => {
            const button = (
              <Button
                block
                icon={<Icon icon={AuthIcons(provider, 18)} style={PROVIDER_ICON_STYLE} />}
                iconProps={{ size: 18, style: PROVIDER_ICON_STYLE }}
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
          {!disableEmailPassword && divider}
        </Flexbox>
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignIn/SignInEmailStep.tsx
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
