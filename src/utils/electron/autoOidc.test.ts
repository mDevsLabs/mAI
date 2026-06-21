import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setDesktopAutoOidcFirstOpenHandled,
  getDesktopAutoOidcFirstOpenHandled,
  DESKTOP_AUTO_OIDC_FIRST_OPEN_STORAGE_KEY
} from './autoOidc';

describe('autoOidc', () => {
  let originalWindow: any;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('setDesktopAutoOidcFirstOpenHandled', () => {
    it('should return false if window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(setDesktopAutoOidcFirstOpenHandled()).toBe(false);
      vi.unstubAllGlobals();
    });

    it('should set item in localStorage and return true', () => {
      const setItemMock = vi.fn();
      vi.stubGlobal('window', {
        localStorage: {
          setItem: setItemMock
        }
      });

      const result = setDesktopAutoOidcFirstOpenHandled();
      expect(setItemMock).toHaveBeenCalledWith(DESKTOP_AUTO_OIDC_FIRST_OPEN_STORAGE_KEY, '1');
      expect(result).toBe(true);
      vi.unstubAllGlobals();
    });

    it('should return false if localStorage.setItem throws an error', () => {
      vi.stubGlobal('window', {
        localStorage: {
          setItem: () => {
            throw new Error('Storage disabled');
          }
        }
      });

      const result = setDesktopAutoOidcFirstOpenHandled();
      expect(result).toBe(false);
      vi.unstubAllGlobals();
    });
  });

  describe('getDesktopAutoOidcFirstOpenHandled', () => {
    it('should return true if window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
      vi.unstubAllGlobals();
    });

    it('should return true if localStorage item is "1"', () => {
      vi.stubGlobal('window', {
        localStorage: {
          getItem: vi.fn().mockReturnValue('1')
        }
      });
      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
      vi.unstubAllGlobals();
    });

    it('should return false if localStorage item is not "1"', () => {
      vi.stubGlobal('window', {
        localStorage: {
          getItem: vi.fn().mockReturnValue(null)
        }
      });
      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(false);
      vi.unstubAllGlobals();
    });

    it('should return true if localStorage.getItem throws an error', () => {
      vi.stubGlobal('window', {
        localStorage: {
          getItem: () => {
            throw new Error('Storage disabled');
          }
        }
      });
      expect(getDesktopAutoOidcFirstOpenHandled()).toBe(true);
      vi.unstubAllGlobals();
    });
  });
});
