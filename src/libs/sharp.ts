/**
 * Sharp wrapper for Vercel Serverless Functions
 * 
 * Vercel Serverless Functions do not have libvips installed,
 * so we need to handle this gracefully.
 * 
 * This wrapper will:
 * 1. In serverless environments: use a mock that doesn't require libvips
 * 2. In normal environments: load the real sharp module
 * 3. Provide clear error messages for debugging
 */

import debug from 'debug';

const log = debug('lobe:sharp-wrapper');

// Detect Vercel Serverless Function environment
const isVercelServerless = (): boolean => {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL)
  );
};

// Detect if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerlessEnvironment = (): boolean => {
  return (
    isVercelServerless() ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.NEXT_RUNTIME === 'experimental-edge'
  );
};

// Cache for the sharp module
let sharpModule: any = null;
let isServerlessCached: boolean | null = null;

/**
 * Get the sharp module
 * In serverless environments, returns a mock
 * In normal environments, loads the real sharp module
 */
async function getSharpModule(): Promise<any> {
  // Check if we're in a serverless environment
  const serverless = isServerlessEnvironment();
  
  if (serverless) {
    if (sharpModule) return sharpModule;
    
    // In serverless, use the mock
    log('Using sharp mock in serverless environment');
    const { default: mockSharp } = await import('./sharp.serverless');
    sharpModule = mockSharp;
    return sharpModule;
  }
  
  // In non-serverless environments, try to load the real sharp
  if (sharpModule) return sharpModule;
  
  try {
    const sharp = await import('sharp');
    sharpModule = sharp.default || sharp;
    log('Sharp module loaded successfully');
    return sharpModule;
  } catch (error) {
    log('Failed to load sharp module:', error);
    // Fallback to mock even in non-serverless if sharp fails to load
    const { default: mockSharp } = await import('./sharp.serverless');
    sharpModule = mockSharp;
    return sharpModule;
  }
}

/**
 * Get sharp instance if available
 * Returns mock in serverless environments, real sharp otherwise
 */
export async function getSharp() {
  return await getSharpModule();
}

/**
 * Check if we're in a serverless environment
 */
export function isServerless(): boolean {
  return isServerlessEnvironment();
}

/**
 * Check if sharp is available (not in serverless)
 */
export function isSharpAvailable(): boolean {
  return !isServerlessEnvironment();
}

/**
 * Safe wrapper for sharp operations
 * In serverless: uses mock that returns default values
 * In normal: uses real sharp
 */
export async function withSharp<T>(
  callback: (sharp: any) => Promise<T>
): Promise<T | null> {
  try {
    const sharp = await getSharpModule();
    return await callback(sharp);
  } catch (error) {
    log('Sharp operation failed:', error);
    return null;
  }
}

// Re-export sharp types for convenience
export type { Sharp, SharpOptions } from 'sharp';
