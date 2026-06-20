import { Form } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import type { BusinessSignupFomData } from '@/business/client/hooks/useBusinessSignup';
import { useBusinessSignin } from '@/business/client/hooks/useBusinessSignin';
import { useBusinessSignup } from '@/business/client/hooks/useBusinessSignup';
import { message } from '@/components/AntdStaticMethods';
import type { AuthFetchOptions } from '@/features/Auth/utils/authFetchOptions';
import { withCaptchaToken } from '@/features/Auth/utils/authFetchOptions';
import { useAuthServerConfigStore } from '@/features/AuthShell';
import { trackLoginOrSignupClicked } from '@/features/User/UserLoginOrSignup/trackLoginOrSignupClicked';
import { signUp, signIn } from '@/libs/better-auth/auth-client';
import { isBuiltinProvider, normalizeProviderId } from '@/libs/better-auth/utils/client';
import { buildOnboardingRedirectUrl } from '@/utils/onboardingRedirect';

import type { BaseSignUpFormValues } from './types';

export type SignUpFormValues = BaseSignUpFormValues & BusinessSignupFomData;

const LAST_AUTH_PROVIDER_KEY = 'lobehub:auth:last-provider:v1';

interface SignUpErrorLike {
  code?: string;
  details?: {
    cause?: {
      code?: string;
    };
  };
  message?: string;
}

export const useSignUp = () => {
  const { t } = useTranslation(['auth', 'authError']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<SignUpFormValues>();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const { getCaptchaTokenOnError, getFetchOptions, preSocialSignupCheck, businessElement } =
    useBusinessSignup(form);
  
  const { getAdditionalData: getSocialAdditionalData, preSocialSigninCheck, ssoProviders } = useBusinessSignin();

  const [lastAuthProvider] = useState(() => {
    try {
      return localStorage.getItem(LAST_AUTH_PROVIDER_KEY);
    } catch {
      return null;
    }
  });

  const serverConfigInit = useAuthServerConfigStore((s) => s.serverConfigInit);
  const oAuthSSOProviders = useAuthServerConfigStore((s) => s.serverConfig.oAuthSSOProviders) || [];

  const enableEmailVerification = useAuthServerConfigStore(
    (s) => s.serverConfig.enableEmailVerification || false,
  );
  const enableBusinessFeatures = useAuthServerConfigStore(
    (s) => s.serverConfig.enableBusinessFeatures || false,
  );

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    await trackLoginOrSignupClicked({ spm: 'signup.submit.click' });

    try {
      if (enableBusinessFeatures && !(await preSocialSignupCheck(values))) {
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/';
      // New users always go through onboarding first; the original target is
      // threaded via the `callbackUrl` query param and restored on finish.
      const redirectUrl = buildOnboardingRedirectUrl(callbackUrl);
      const username = values.email.split('@')[0];
      const fetchOptions = await getFetchOptions();

      const submit = async (nextFetchOptions?: AuthFetchOptions) =>
        signUp.email({
          callbackURL: redirectUrl,
          email: values.email,
          fetchOptions: nextFetchOptions,
          name: username,
          password: values.password,
        });

      let { error } = await submit(fetchOptions);

      if (error) {
        const captchaToken = await getCaptchaTokenOnError(error);
        if (captchaToken === null) return;
        if (captchaToken) {
          ({ error } = await submit(withCaptchaToken(fetchOptions, captchaToken)));
        }
      }

      if (error) {
        const signUpError = error as SignUpErrorLike;
        const isEmailDuplicate =
          signUpError.code === 'FAILED_TO_CREATE_USER' &&
          signUpError.details?.cause?.code === '23505';

        if (isEmailDuplicate) {
          message.error(t('betterAuth.errors.emailExists'));
          return;
        }

        if (signUpError.code === 'INVALID_EMAIL' || signUpError.message === 'Invalid email') {
          message.error(t('betterAuth.errors.emailInvalid'));
          return;
        }

        const translated = signUpError.code
          ? t(`authError:codes.${signUpError.code}`, { defaultValue: '' })
          : '';
        message.error(translated || signUpError.message || t('betterAuth.signup.error'));
        return;
      }

      if (enableEmailVerification) {
        navigate(
          `/verify-email?email=${encodeURIComponent(values.email)}&callbackUrl=${encodeURIComponent(redirectUrl)}`,
        );
      } else {
        // onboarding lives in the main app, outside this auth SPA — full page load required
        window.location.href = redirectUrl;
      }
    } catch {
      message.error(t('betterAuth.signup.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    const normalizedProvider = normalizeProviderId(provider);
    await trackLoginOrSignupClicked({
      provider: normalizedProvider,
      spm: 'signup.social.click',
    });

    try {
      if (enableBusinessFeatures && !(await preSocialSigninCheck())) {
        setSocialLoading(null);
        return;
      }

      try {
        localStorage.setItem(LAST_AUTH_PROVIDER_KEY, provider);
      } catch {
        // Ignore localStorage errors (e.g., quota exceeded, private mode)
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/';
      // First-time OAuth users are signups — land them on onboarding first
      const newUserCallbackURL = buildOnboardingRedirectUrl(callbackUrl);
      const additionalData = await getSocialAdditionalData();
      const signInWithAdditionalData = async () =>
        isBuiltinProvider(normalizedProvider)
          ? await signIn.social({
              additionalData,
              callbackURL: callbackUrl,
              newUserCallbackURL,
              provider: normalizedProvider,
            })
          : await signIn.oauth2({
              additionalData,
              callbackURL: callbackUrl,
              newUserCallbackURL,
              providerId: normalizedProvider,
            });

      const result = await signInWithAdditionalData();

      if (result && 'error' in result && result.error) throw result.error;
    } catch (error) {
      console.error(`${normalizedProvider} sign in error:`, error);
      message.error(t('betterAuth.signin.socialError'));
    } finally {
      setSocialLoading(null);
    }
  };

  const resolvedProviders = enableBusinessFeatures ? ssoProviders : oAuthSSOProviders;
  const sortedProviders = lastAuthProvider
    ? [...resolvedProviders].sort((a, b) => {
        if (a === lastAuthProvider) return -1;
        if (b === lastAuthProvider) return 1;
        return 0;
      })
    : resolvedProviders;

  return {
    businessElement,
    form,
    loading,
    onSubmit: handleSignUp,
    oAuthSSOProviders: sortedProviders,
    socialLoading,
    lastAuthProvider,
    handleSocialSignIn,
    serverConfigInit: enableBusinessFeatures ? true : serverConfigInit,
  };
};
