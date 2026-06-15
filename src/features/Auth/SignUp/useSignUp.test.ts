import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignUp } from './useSignUp';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSearchParamsGet = vi.hoisted(() => vi.fn().mockReturnValue(null));
const mockMessageError = vi.hoisted(() => vi.fn());
const mockSignUpEmail = vi.hoisted(() => vi.fn());
const mockSignInSocial = vi.hoisted(() => vi.fn());
const mockSignInOauth2 = vi.hoisted(() => vi.fn());
const mockGetCaptchaTokenOnError = vi.hoisted(() => vi.fn());
const mockLocalStorage = vi.hoisted(() => {
  const store = new Map<string, string>();

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [{ get: mockSearchParamsGet }],
}));

vi.mock('@/components/AntdStaticMethods', () => ({
  message: { error: mockMessageError, success: vi.fn() },
}));

vi.mock('@/libs/better-auth/auth-client', () => ({
  signIn: {
    oauth2: mockSignInOauth2,
    social: mockSignInSocial,
  },
  signUp: { email: mockSignUpEmail },
}));

vi.mock('@/libs/better-auth/utils/client', () => ({
  isBuiltinProvider: (p: string) =>
    ['google', 'github', 'apple', 'discord', 'slack', 'spotify', 'twitch', 'notion'].includes(p),
  normalizeProviderId: (p: string) => p,
}));

vi.mock('@lobechat/business-const', () => ({
  BRANDING_NAME: 'mAI',
  ENABLE_BUSINESS_FEATURES: false,
}));

vi.mock('@/business/client/hooks/useBusinessSignup', () => ({
  useBusinessSignup: () => ({
    businessElement: null,
    getCaptchaTokenOnError: mockGetCaptchaTokenOnError,
    getFetchOptions: async () => undefined,
    preSocialSignupCheck: async () => true,
  }),
}));

<<<<<<< HEAD:src/app/[variants]/(auth)/signup/[[...signup]]/useSignUp.test.ts
vi.mock('@/business/client/hooks/useBusinessSignin', () => ({
  useBusinessSignin: () => ({
    getAdditionalData: async () => ({}),
    preSocialSigninCheck: async () => true,
    ssoProviders: [],
  }),
}));

vi.mock('@/features/User/UserLoginOrSignup/trackLoginOrSignupClicked', () => ({
  trackLoginOrSignupClicked: vi.fn().mockResolvedValue(undefined),
}));

// motion/react-m exports `form` as a motion HTML element — mock the whole module
vi.mock('motion/react-m', () => ({ form: {} }));

=======
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignUp/useSignUp.test.ts
let mockEnableEmailVerification = false;
vi.mock('@/features/AuthShell', () => ({
  useAuthServerConfigStore: (selector: (s: any) => any) =>
    selector({
      serverConfig: {
        enableEmailVerification: mockEnableEmailVerification,
        oAuthSSOProviders: ['google', 'github'],
      },
      serverConfigInit: true,
    }),
}));

<<<<<<< HEAD:src/app/[variants]/(auth)/signup/[[...signup]]/useSignUp.test.ts
// Mock global localStorage
vi.stubGlobal('localStorage', mockLocalStorage);
=======
const originalLocation = window.location;
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:src/features/Auth/SignUp/useSignUp.test.ts

describe('useSignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSearchParamsGet.mockReturnValue(null);
    mockGetCaptchaTokenOnError.mockResolvedValue(undefined);
    mockEnableEmailVerification = false;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial values', () => {
      const { result } = renderHook(() => useSignUp());

      expect(result.current.loading).toBe(false);
      expect(result.current.onSubmit).toBeInstanceOf(Function);
    });

    it('should return socialLoading as null initially', () => {
      const { result } = renderHook(() => useSignUp());

      expect(result.current.socialLoading).toBeNull();
    });

    it('should return oAuthSSOProviders from config', () => {
      const { result } = renderHook(() => useSignUp());

      expect(result.current.oAuthSSOProviders).toEqual(['google', 'github']);
    });

    it('should return serverConfigInit from config', () => {
      const { result } = renderHook(() => useSignUp());

      expect(result.current.serverConfigInit).toBe(true);
    });

    it('should return handleSocialSignIn as a function', () => {
      const { result } = renderHook(() => useSignUp());

      expect(result.current.handleSocialSignIn).toBeInstanceOf(Function);
    });
  });

  describe('handleSignUp', () => {
    const validValues = {
      confirmPassword: 'Password123!',
      email: 'new@example.com',
      password: 'Password123!',
    };

    it('should call signUp.email with correct params', async () => {
      mockSignUpEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockSignUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          name: 'new',
          password: 'Password123!',
        }),
      );
    });

    it('should redirect to onboarding on success', async () => {
      mockSignUpEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(window.location.href).toBe('/onboarding');
    });

    it('should thread callbackUrl from search params through onboarding', async () => {
      mockSearchParamsGet.mockImplementation((key: string) =>
        key === 'callbackUrl' ? '/dashboard' : null,
      );
      mockSignUpEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockSignUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ callbackURL: '/onboarding?callbackUrl=%2Fdashboard' }),
      );
      expect(window.location.href).toBe('/onboarding?callbackUrl=%2Fdashboard');
    });

    it('should redirect to verify-email when email verification is enabled', async () => {
      mockEnableEmailVerification = true;
      mockSignUpEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/verify-email?email=new%40example.com'),
      );
    });

    it('should derive username from email prefix', async () => {
      mockSignUpEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit({ ...validValues, email: 'john.doe@gmail.com' });
      });

      expect(mockSignUpEmail).toHaveBeenCalledWith(expect.objectContaining({ name: 'john.doe' }));
    });

    it('should show error for duplicate email', async () => {
      mockSignUpEmail.mockResolvedValue({
        error: {
          code: 'FAILED_TO_CREATE_USER',
          details: { cause: { code: '23505' } },
        },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockMessageError).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should show error for invalid email', async () => {
      mockSignUpEmail.mockResolvedValue({
        error: { code: 'INVALID_EMAIL', message: 'Invalid email' },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockMessageError).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should show translated error for known error codes', async () => {
      mockSignUpEmail.mockResolvedValue({
        error: { code: 'SOME_KNOWN_CODE', message: 'fallback msg' },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockMessageError).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should retry sign up with captcha token when captcha is required', async () => {
      mockGetCaptchaTokenOnError.mockResolvedValue('captcha-token');
      mockSignUpEmail
        .mockResolvedValueOnce({
          error: { code: 'CAPTCHA_REQUIRED', message: 'Missing CAPTCHA response' },
        })
        .mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockSignUpEmail).toHaveBeenCalledTimes(2);
      expect(mockSignUpEmail).toHaveBeenLastCalledWith(
        expect.objectContaining({
          fetchOptions: { headers: { 'x-captcha-response': 'captcha-token' } },
        }),
      );
      expect(mockMessageError).not.toHaveBeenCalled();
      expect(window.location.href).toBe('/onboarding');
    });

    it('should stop sign up when captcha modal is cancelled', async () => {
      mockGetCaptchaTokenOnError.mockResolvedValue(null);
      mockSignUpEmail.mockResolvedValue({
        error: { code: 'CAPTCHA_REQUIRED', message: 'Missing CAPTCHA response' },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockSignUpEmail).toHaveBeenCalledTimes(1);
      expect(mockMessageError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should show generic error on unexpected exception', async () => {
      mockSignUpEmail.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockMessageError).toHaveBeenCalled();
    });

    it('should set loading during sign up and reset after', async () => {
      let resolveSignUp: (v: any) => void;
      mockSignUpEmail.mockReturnValue(
        new Promise((resolve) => {
          resolveSignUp = resolve;
        }),
      );

      const { result } = renderHook(() => useSignUp());

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.onSubmit(validValues);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSignUp!({ error: null });
        await submitPromise!;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleSocialSignIn', () => {
    it('should call signIn.social for builtin providers', async () => {
      mockSignInSocial.mockResolvedValue({ url: 'https://google.com/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      expect(mockSignInSocial).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      );
      expect(mockMessageError).not.toHaveBeenCalled();
    });

    it('should call signIn.oauth2 for custom providers', async () => {
      mockSignInOauth2.mockResolvedValue({ url: 'https://custom.com/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('custom-oidc');
      });

      expect(mockSignInOauth2).toHaveBeenCalledWith(
        expect.objectContaining({ providerId: 'custom-oidc' }),
      );
    });

    it('should save last auth provider to localStorage', async () => {
      mockSignInSocial.mockResolvedValue({ url: 'https://google.com/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      expect(localStorage.getItem('lobehub:auth:last-provider:v1')).toBe('google');
    });

    it('should show error when social sign in fails', async () => {
      mockSignInSocial.mockResolvedValue({
        error: { message: 'OAuth failed', status: 500 },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      expect(mockMessageError).toHaveBeenCalled();
    });

    it('should NOT throw when result has error: null (redirect case)', async () => {
      mockSignInSocial.mockResolvedValue({
        error: null,
        redirect: true,
        url: 'https://google.com/auth',
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      // Should not show error toast — this is the critical regression test
      expect(mockMessageError).not.toHaveBeenCalled();
    });

    it('should use social sign in for built-in providers', async () => {
      mockSignInSocial.mockResolvedValue({ url: 'https://discord.com/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('discord');
      });

      expect(mockSignInSocial).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'discord',
        }),
      );
      expect(mockSignInOauth2).not.toHaveBeenCalled();
    });

    it('should use oauth2 sign in for non-builtin providers', async () => {
      mockSignInOauth2.mockResolvedValue({ url: 'https://telegram.org/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('telegram');
      });

      expect(mockSignInOauth2).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: 'telegram',
        }),
      );
    });

    it('should reset socialLoading after completion', async () => {
      mockSignInSocial.mockResolvedValue({ url: 'https://google.com/auth' });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      expect(result.current.socialLoading).toBeNull();
    });

    it('should reset socialLoading after error', async () => {
      mockSignInSocial.mockResolvedValue({
        error: { message: 'Failed', status: 500 },
      });

      const { result } = renderHook(() => useSignUp());

      await act(async () => {
        await result.current.handleSocialSignIn('google');
      });

      expect(result.current.socialLoading).toBeNull();
    });
  });
});
