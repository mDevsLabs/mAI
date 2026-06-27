/**
 * SAFE SHARP WRAPPER - DO NOT IMPORT DIRECTLY
 * 
 * This file is designed to be used as a DROP-IN REPLACEMENT for 'sharp'
 * It prevents Turbopack from trying to bundle the real sharp module
 * in Vercel Serverless Functions.
 * 
 * USAGE:
 * 1. Add this to your next.config.ts webpack aliases:
 *    config.resolve.alias = {
 *      ...config.resolve.alias,
 *      'sharp': require.resolve('./src/libs/sharp.safe.ts'),
 *    };
 * 2. This will intercept ALL imports of 'sharp' and use this safe version
 */

// IMPORTANT: Do NOT import 'sharp' here - it would cause the same error!
// This file MUST NOT import the real sharp module

import debug from 'debug';

const log = debug('lobe:sharp-safe');

// Detect if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerlessEnvironment = (): boolean => {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV === 'production' && process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.NEXT_RUNTIME === 'experimental-edge'
  );
};

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Create a mock sharp instance
 * This provides a minimal interface that prevents crashes
 */
function createMockSharpInstance(buffer: Buffer | string) {
  const mockInstance = {
    // Metadata returns default values
    metadata: async () => ({
      width: buffer instanceof Buffer ? 512 : 0,
      height: buffer instanceof Buffer ? 512 : 0,
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
    
    // Chainable methods that return the instance
    resize: (width: number, height: number, options: any = {}) => mockInstance,
    webp: (options: any = {}) => mockInstance,
    png: (options: any = {}) => mockInstance,
    jpeg: (options: any = {}) => mockInstance,
    jpg: (options: any = {}) => mockInstance,
    toFormat: (format: string, options: any = {}) => mockInstance,
    
    // Terminal methods
    toBuffer: async () => {
      if (buffer instanceof Buffer) return buffer;
      return Buffer.from([]);
    },
    toFile: async (_path: string) => {},
    pipe: (stream: any) => stream,
    
    // Other methods
    extract: (options: any) => mockInstance,
    composite: (images: any[]) => mockInstance,
    flatten: (options: any = {}) => mockInstance,
    gamma: (value: number) => mockInstance,
    negate: (options: any = {}) => mockInstance,
    normalize: (options: any = {}) => mockInstance,
    threshold: (value: number, options: any = {}) => mockInstance,
    blur: (sigma?: number, options?: any) => mockInstance,
    sharpen: (sigma?: number, options?: any) => mockInstance,
    median: (size?: number) => mockInstance,
    rotate: (angle: number, options?: any) => mockInstance,
    flip: (flip?: boolean) => mockInstance,
    flop: (flop?: boolean) => mockInstance,
    
    // Getters/Setters
    get width() { return 512; },
    get height() { return 512; },
  };
  
  return mockInstance;
}

/**
 * Mock sharp constructor
 * This is the main export that replaces the real sharp module
 */
function sharp(input: Buffer | string, options?: any) {
  if (isBrowser) {
    log('sharp: Browser environment detected - using mock');
    return createMockSharpInstance(input instanceof Buffer ? input : Buffer.from([]));
  }
  
  if (isServerlessEnvironment()) {
    log('sharp: Serverless environment detected - using mock');
    return createMockSharpInstance(input instanceof Buffer ? input : Buffer.from([]));
  }
  
  // In non-serverless Node.js environments, we need to be careful
  // We CANNOT import the real sharp here because:
  // 1. Turbopack will try to bundle it and fail
  // 2. This file is meant to be a drop-in replacement
  // So we always return the mock, even in Node.js
  // The real sharp should be imported directly where needed in non-Vercel environments
  
  log('sharp: Using mock (this file should not be used in non-Vercel environments)');
  return createMockSharpInstance(input instanceof Buffer ? input : Buffer.from([]));
}

// Add static properties to match sharp's interface
Object.defineProperties(sharp, {
  cache: { value: false, writable: true },
  concurrency: { value: 0, writable: true },
  counters: { value: {}, writable: true },
  defaults: { value: {}, writable: true },
  format: { 
    value: {
      jpeg: {},
      png: {},
      webp: {},
      gif: {},
      tiff: {},
      svg: {},
      raw: {},
    }, 
    writable: true 
  },
  icc: { value: () => sharp, writable: true },
  queue: { value: {}, writable: true },
});

// This is critical: the default export must be the sharp function
sharp.default = sharp;

// Export everything
module.exports = sharp;
module.exports.default = sharp;

export default sharp;
export { sharp };
