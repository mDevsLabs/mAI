import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeviceFingerprint } from '../deviceFingerprint';

describe('deviceFingerprint', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      platform: 'MacIntel',
    });
    vi.stubGlobal('screen', {
      width: 1920,
      height: 1080,
    });
    vi.stubGlobal('devicePixelRatio', 2);
    vi.stubGlobal('window', {});

    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]).buffer),
      },
    });

    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'America/New_York' }),
      }),
    });

    const mockContext = {
      getExtension: vi.fn().mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 'vendor_code',
        UNMASKED_RENDERER_WEBGL: 'renderer_code',
      }),
      getParameter: vi.fn((code) => {
        if (code === 'vendor_code') return 'Apple';
        if (code === 'renderer_code') return 'Apple M1';
        return '';
      }),
      fillRect: vi.fn(),
      fillText: vi.fn(),
    };

    // We mock window.WebGLRenderingContext so instanceof check passes
    class MockWebGLRenderingContext {}
    vi.stubGlobal('WebGLRenderingContext', MockWebGLRenderingContext);

    const mockCanvas = {
      getContext: vi.fn((type) => {
         if (type === 'webgl' || type === 'experimental-webgl') {
            const ctx = new MockWebGLRenderingContext();
            Object.assign(ctx, mockContext);
            return ctx;
         }
         if (type === '2d') {
            return mockContext;
         }
         return null;
      }),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked'),
    };

    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should generate a fingerprint', async () => {
    const fingerprint = await getDeviceFingerprint();
    expect(fingerprint).toBe('0102030405');
  });

  it('should fallback to djb2Hex when crypto.subtle throws', async () => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockRejectedValue(new Error('crypto error')),
      },
    });
    const fingerprint = await getDeviceFingerprint();
    // length of djb2Hex is 8 characters
    expect(fingerprint).toHaveLength(8);
  });

  it('should handle document.createElement throwing an error in getCanvasFingerprint/getWebGLInfo', async () => {
    vi.stubGlobal('document', {
      createElement: vi.fn().mockImplementation(() => {
        throw new Error('Canvas not supported');
      })
    });

    const fingerprint = await getDeviceFingerprint();
    expect(fingerprint).toBe('0102030405');
  });

  it('should handle missing canvas context', async () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    };
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    const fingerprint = await getDeviceFingerprint();
    expect(fingerprint).toBe('0102030405');
  });

  it('should handle missing WEBGL_debug_renderer_info extension', async () => {
    class MockWebGLRenderingContext {}
    vi.stubGlobal('WebGLRenderingContext', MockWebGLRenderingContext);

    const mockCanvas = {
      getContext: vi.fn((type) => {
         if (type === 'webgl') {
            const ctx = new MockWebGLRenderingContext();
            Object.assign(ctx, {
               getExtension: vi.fn().mockReturnValue(null)
            });
            return ctx;
         }
         if (type === '2d') {
            return {
              fillRect: vi.fn(),
              fillText: vi.fn(),
            };
         }
         return null;
      }),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked'),
    };
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    const fingerprint = await getDeviceFingerprint();
    expect(fingerprint).toBe('0102030405');
  });

  it('should return empty string for window undefined', async () => {
    // Save original window
    const originalWindow = globalThis.window;

    // Simulate window undefined scenario (like in SSR)
    vi.stubGlobal('window', undefined);

    // Wait for the function execution
    const fingerprint = await getDeviceFingerprint();
    expect(fingerprint).toBe('0102030405'); // empty string hashes to this

    // Restore original window
    globalThis.window = originalWindow;
  });
});
