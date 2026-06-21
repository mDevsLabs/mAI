import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';

import {
  DESKTOP_AUTO_OIDC_FIRST_OPEN_STORAGE_KEY,
  getDesktopAutoOidcFirstOpenHandled,
  setDesktopAutoOidcFirstOpenHandled,
} from './autoOidc';

describe('autoOidc', () => {
  const originalWindow = global.window;

  afterEach(() => {
    vi.restoreAllMocks();
    global.window = originalWindow;
  });

  describe('getDesktopAutoOidcFirstOpenHandled', () => {
    it('should return true if window is undefined', () => {
      // @ts-ignore
      delete global.window;
      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
    });

    it('should return true if localStorage has item with value "1"', () => {
      global.window = {
        // @ts-ignore
        localStorage: {
          getItem: vi.fn().mockReturnValue('1'),
        },
      };

      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
      expect(global.window.localStorage.getItem).toHaveBeenCalledWith(
        DESKTOP_AUTO_OIDC_FIRST_OPEN_STORAGE_KEY,
      );
    });

    it('should return false if localStorage has item with value other than "1"', () => {
      global.window = {
        // @ts-ignore
        localStorage: {
          getItem: vi.fn().mockReturnValue('0'),
        },
      };

      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(false);
    });

    it('should return false if localStorage has no item', () => {
      global.window = {
        // @ts-ignore
        localStorage: {
          getItem: vi.fn().mockReturnValue(null),
        },
      };

      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(false);
    });

    it('should return true if localStorage throws an error', () => {
      global.window = {
        // @ts-ignore
        get localStorage() {
          throw new Error('Access Denied');
        },
      };

      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
    });
  });

  describe('setDesktopAutoOidcFirstOpenHandled', () => {
    it('should return false if window is undefined', () => {
      // @ts-ignore
      delete global.window;
      expect(setDesktopAutoOidcFirstOpenHandled()).toBe(false);
    });

    it('should set item in localStorage and return true', () => {
      global.window = {
        // @ts-ignore
        localStorage: {
          setItem: vi.fn(),
        },
      };

      expect(setDesktopAutoOidcFirstOpenHandled()).toBe(true);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
        DESKTOP_AUTO_OIDC_FIRST_OPEN_STORAGE_KEY,
        '1',
      );
    });

    it('should return false if localStorage throws an error', () => {
      global.window = {
        // @ts-ignore
        get localStorage() {
          throw new Error('Access Denied');
        },
      };

      expect(setDesktopAutoOidcFirstOpenHandled()).toBe(false);
    });
  });
});
