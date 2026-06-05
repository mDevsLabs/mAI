import { ENABLE_BUSINESS_FEATURES } from '@lobechat/business-const';
import { form } from 'motion/react-m';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BusinessSignupFomData } from '@/business/client/hooks/useBusinessSignup';
import { useBusinessSignup } from '@/business/client/hooks/useBusinessSignup';
import { useBusinessSignin } from '@/business/client/hooks/useBusinessSignin';
import { message } from '@/components/AntdStaticMethods';
import { trackLoginOrSignupClicked } from '@/features/User/UserLoginOrSignup/trackLoginOrSignupClicked';
import { signIn, signUp } from '@/libs/better-auth/auth-client';
import { isBuiltinProvider, normalizeProviderId } from '@/libs/better-auth/utils/client';

import { useAuthServerConfigStore } from '../../_layout/AuthServerConfigProvider';
import type { AuthFetchOptions } from '../../utils/authFetchOptions';
import { withCaptchaToken } from '../../utils/authFetchOptions';
import type { BaseSignUpFormValues } from './types';

export type SignUpFormValues = BaseSignUpFormValues & BusinessSignupFomData;

interface SignUpErrorLike {
  code?: string;
  details?: {
    cause?: {
      code?: string;
    };
  };
  message?: string;
}

const LAST_AUTH_PROVIDER_KEY = 'lobehub:auth:last-provider:v1';

export const useSignUp = () => {
  const { t } = useTranslation(['auth', 'authError']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { getCaptchaTokenOnError, getFetchOptions, preSocialSignupCheck, businessElement } =
    useBusinessSignup(form);
  const { getAdditionalData, preSocialSigninCheck, ssoProviders } = useBusinessSignin();
  const enableEmailVerification = useAuthServerConfigStore(
    (s) => s.serverConfig.enableEmailVerification || false,
  );
  const serverConfigInit = useAuthServerConfigStore((s) => s.serverConfigInit);
  const oAuthSSOProviders = useAuthServerConfigStore((s) => s.serverConfig.oAuthSSOProviders) || [];

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    await trackLoginOrSignupClicked({ spm: 'signup.submit.click' });

    try {
      if (ENABLE_BUSINESS_FEATURES && !(await preSocialSignupCheck(values))) {
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/';
      const username = values.email.split('@')[0];
      const fetchOptions = await getFetchOptions();

      const submit = async (nextFetchOptions?: AuthFetchOptions) =>
        signUp.email({
          callbackURL: callbackUrl,
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
        router.push(
          `/verify-email?email=${encodeURIComponent(values.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      } else {
        router.push(callbackUrl);
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
      if (ENABLE_BUSINESS_FEATURES && !(await preSocialSigninCheck())) {
        setSocialLoading(null);
        return;
      }

      try {
        localStorage.setItem(LAST_AUTH_PROVIDER_KEY, normalizedProvider);
      } catch {
        // Ignore localStorage errors (e.g., quota exceeded, private mode)
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/';
      const additionalData = await getAdditionalData();
      const signInWithAdditionalData = async () =>
        isBuiltinProvider(normalizedProvider)
          ? await signIn.social({
              additionalData,
              callbackURL: callbackUrl,
              provider: normalizedProvider,
            })
          : await signIn.oauth2({
              additionalData,
              callbackURL: callbackUrl,
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

  const resolvedProviders = ENABLE_BUSINESS_FEATURES ? ssoProviders : oAuthSSOProviders;

  return {
    businessElement,
    handleSocialSignIn,
    loading,
    oAuthSSOProviders: resolvedProviders,
    onSubmit: handleSignUp,
    serverConfigInit: ENABLE_BUSINESS_FEATURES ? true : serverConfigInit,
    socialLoading,
  };
};
