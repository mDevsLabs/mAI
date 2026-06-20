'use client';

import { BRANDING_NAME } from '@lobechat/business-const';
import { Button, Flexbox, Icon, Skeleton, Text } from '@lobehub/ui';
import { Form, Input, type InputRef } from 'antd';
import { Badge, Divider } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Lock, Mail } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';

import AuthIcons from '@/components/AuthIcons';
import { AuthCard } from '@/features/AuthCard';
import { AuthAgreement } from '@/features/AuthShell';
import { trackLoginOrSignupClicked } from '@/features/User/UserLoginOrSignup/trackLoginOrSignupClicked';

import { useSignUp } from './useSignUp';

const styles = createStaticStyles(({ css, cssVar }) => ({
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

// Pin both the provider logo and the loading spinner to the same spot so the
// spinner doesn't jump when a social button enters its loading state.
const PROVIDER_ICON_STYLE: CSSProperties = { left: 12, position: 'absolute', top: 13 };

// Turn a provider id into a display name, e.g. "google" -> "Google".
const getProviderName = (provider: string) =>
  provider.toLowerCase().replaceAll(/(^|[_-])([a-z])/g, (_, __, c) => c.toUpperCase());

const BetterAuthSignUpForm = () => {
  const {
    form,
    loading,
    onSubmit,
    businessElement,
    oAuthSSOProviders,
    socialLoading,
    lastAuthProvider,
    handleSocialSignIn,
    serverConfigInit,
  } = useSignUp();

  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailInputRef = useRef<InputRef>(null);
  const passwordInputRef = useRef<InputRef>(null);
  const [showAllProviders, setShowAllProviders] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      form.setFieldsValue({ email });
      passwordInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, [searchParams, form]);

  const divider = (
    <Divider style={{ marginBlock: 16 }}>
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

  const footer = (
    <Text>
      {t('betterAuth.signup.hasAccount')}{' '}
      <Link
        to={`/signin?${searchParams.toString()}`}
        onClick={(event) => {
          event.preventDefault();
          void trackLoginOrSignupClicked({ spm: 'signup.go_to_signin.click' }).finally(() => {
            navigate(`/signin?${searchParams.toString()}`);
          });
        }}
      >
        {t('betterAuth.signup.signinLink')}
      </Link>
    </Text>
  );

  const hasMoreProviders = oAuthSSOProviders.length > 3;
  const visibleProviders = hasMoreProviders && !showAllProviders
    ? oAuthSSOProviders.slice(0, 3)
    : oAuthSSOProviders;

  return (
    <AuthCard footer={footer} title={t('betterAuth.signup.cardTitle', { appName: BRANDING_NAME })}>
      {!serverConfigInit && (
        <Flexbox gap={12} style={{ marginBottom: 12 }}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
          {divider}
        </Flexbox>
      )}
      {serverConfigInit && oAuthSSOProviders.length > 0 && (
        <Flexbox gap={12} style={{ marginBottom: 12 }}>
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
                  onClick={() => handleSocialSignIn(provider)}
                >
                  {getProviderLabel(provider)}
                </Button>
              );
              const showLastUsed = provider === lastAuthProvider;
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
          {divider}
        </Flexbox>
      )}
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="email"
          rules={[
            { message: t('betterAuth.errors.emailRequired'), required: true },
            { message: t('betterAuth.errors.emailInvalid'), type: 'email' },
          ]}
        >
          <Input
            placeholder={t('betterAuth.signup.emailPlaceholder')}
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
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { message: t('betterAuth.errors.passwordRequired'), required: true },
            { message: t('betterAuth.errors.passwordMinLength'), min: 8 },
            { max: 64, message: t('betterAuth.errors.passwordMaxLength') },
            {
              message: t('betterAuth.errors.passwordFormat'),
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const hasLetter = /[a-z]/i.test(value);
                const hasNumber = /\d/.test(value);
                return hasLetter && hasNumber ? Promise.resolve() : Promise.reject();
              },
            },
          ]}
        >
          <Input.Password
            placeholder={t('betterAuth.signup.passwordPlaceholder')}
            ref={passwordInputRef}
            size="large"
            prefix={
              <Icon
                icon={Lock}
                style={{
                  marginInline: 6,
                }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          dependencies={['password']}
          name="confirmPassword"
          rules={[
            { message: t('betterAuth.errors.confirmPasswordRequired'), required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('betterAuth.errors.passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder={t('betterAuth.signup.confirmPasswordPlaceholder')}
            size="large"
            prefix={
              <Icon
                icon={Lock}
                style={{
                  marginInline: 6,
                }}
              />
            }
          />
        </Form.Item>

        {businessElement}

        <Form.Item>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            {t('betterAuth.signup.submit')}
          </Button>
        </Form.Item>
      </Form>
      <AuthAgreement />
    </AuthCard>
  );
};

export default BetterAuthSignUpForm;
