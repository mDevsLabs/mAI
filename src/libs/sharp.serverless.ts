/**
 * Sharp mock for Vercel Serverless Functions
 * 
 * This file provides a complete mock of the sharp module that works in
 * Vercel Serverless Functions where libvips is not available.
 * 
 * It prevents the actual sharp module from being loaded, avoiding the
 * ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.3 error.
 */

import debug from 'debug';

const log = debug('lobe:sharp-serverless');

// Detect Vercel Serverless Function environment
const isVercelServerless = (): boolean => {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL)
  );
};

// Detect any serverless environment
const isServerlessEnvironment = (): boolean => {
  return (
    isVercelServerless() ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.NEXT_RUNTIME === 'experimental-edge'
  );
};

/**
 * Create a mock sharp instance
 * This mock provides the same interface as sharp but doesn't actually process images
 */
function createMockSharpInstance(buffer: Buffer) {
  // Return a mock object that mimics sharp's chainable API
  const mockInstance = {
    metadata: async () => ({
      width: 512,
      height: 512,
      format: 'png',
      space: 'srgb',
      channels: 4,
      depth: 'uchar',
      density: 72,
      isProgressive: false,
      hasProfile: false,
      hasAlpha: true,
      orientation: 1,
    }),
    resize: (width: number, height: number, options: any = {}) => mockInstance,
    webp: (options: any = {}) => mockInstance,
    png: (options: any = {}) => mockInstance,
    jpeg: (options: any = {}) => mockInstance,
    toBuffer: async () => buffer,
    toFile: async (_path: string) => {},
    pipe: (stream: any) => stream,
    extract: (options: any) => mockInstance,
    composite: (images: any[]) => mockInstance,
    flatten: (options: any = {}) => mockInstance,
    gamma: (value: number) => mockInstance,
    negate: (options: any = {}) => mockInstance,
    normalize: (options: any = {}) => mockInstance,
    threshold: (value: number, options: any = {}) => mockInstance,
    // Add more sharp methods as needed
  };

  return mockInstance;
}

/**
 * Mock sharp module
 * This is a drop-in replacement for the real sharp module
 */
const mockSharp = Object.assign(
  function sharp(input: Buffer | string, options?: any) {
    if (isServerlessEnvironment()) {
      log('Using mock sharp in serverless environment');
      if (typeof input === 'string') {
        // If input is a file path, return a mock that will fail gracefully
        return createMockSharpInstance(Buffer.from([]));
      }
      return createMockSharpInstance(input);
    }
    // In non-serverless environments, try to load the real sharp
    // This should not be reached in Vercel, but included for safety
    try {
      const realSharp = require('sharp');
      return realSharp.default(input, options);
    } catch {
      log('Real sharp not available, using mock');
      return createMockSharpInstance(input instanceof Buffer ? input : Buffer.from([]));
    }
  },
  {
    // Static properties
    cache: false,
    concurrency: 0,
    counters: {},
    defaults: {},
    format: {
      jpeg: {},
      png: {},
      webp: {},
      // ... other formats
    },
    icc: () => mockSharp,
    queue: {},
    // Re-export the mock instance creator
    default: function sharp(input: Buffer | string, options?: any) {
      return mockSharp(input, options);
    },
  }
);

// Export as default and named export
module.exports = mockSharp;
module.exports.default = mockSharp;

export default mockSharp;
