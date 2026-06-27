/**
 * Sharp wrapper for Vercel Serverless Functions
 * 
 * Vercel Serverless Functions do not have libvips installed,
 * so we need to handle this gracefully.
 * 
 * This wrapper will:
 * 1. Try to load sharp normally
 * 2. If in Vercel environment, use a fallback or skip sharp operations
 * 3. Provide clear error messages for debugging
 */

import debug from 'debug';

const log = debug('lobe:sharp-wrapper');

// Detect Vercel Serverless Function environment
const isVercelServerless = () => {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV === 'production' && process.env.VERCEL
  );
};

// Detect if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerlessEnvironment = () => {
  return (
    isVercelServerless() ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined
  );
};

// Cache for the sharp module
let sharpModule: typeof import('sharp') | null = null;
let sharpLoadError: Error | null = null;

/**
 * Try to load sharp module
 * In serverless environments, this may fail due to missing libvips
 */
async function tryLoadSharp(): Promise<typeof import('sharp') | null> {
  if (sharpModule) return sharpModule;
  if (sharpLoadError) return null;

  try {
    // Try to import sharp
    const sharp = await import('sharp');
    
    // Test if sharp is working by checking its metadata
    const testInstance = sharp.default(Buffer.from([0, 0, 0]));
    await testInstance.metadata();
    
    sharpModule = sharp.default;
    log('Sharp module loaded successfully');
    return sharpModule;
  } catch (error) {
    sharpLoadError = error as Error;
    log('Failed to load sharp module:', error);
    
    // In Vercel serverless, this is expected - log a clear message
    if (isServerlessEnvironment()) {
      log('Sharp not available in serverless environment (expected)');
    } else {
      log('Sharp not available - this may cause issues with image processing');
    }
    
    return null;
  }
}

/**
 * Get sharp instance if available
 * Returns null in serverless environments where libvips is not available
 */
export async function getSharp() {
  return await tryLoadSharp();
}

/**
 * Check if sharp is available in the current environment
 */
export function isSharpAvailable() {
  return sharpModule !== null;
}

/**
 * Check if we're in a serverless environment
 */
export function isServerless() {
  return isServerlessEnvironment();
}

/**
 * Safe wrapper for sharp operations
 * Returns null if sharp is not available (e.g., in Vercel serverless)
 */
export async function withSharp<T>(
  callback: (sharp: typeof import('sharp')) => Promise<T>
): Promise<T | null> {
  const sharp = await getSharp();
  if (!sharp) {
    log('Sharp not available, skipping operation');
    return null;
  }
  return callback(sharp);
}

// Re-export sharp types for convenience
export type { Sharp, SharpOptions } from 'sharp';
