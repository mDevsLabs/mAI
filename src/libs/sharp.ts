/**
 * Sharp wrapper - Use this for all sharp operations
 * 
 * This wrapper will:
 * 1. In Vercel/Serverless: Always use the safe mock (no native modules)
 * 2. In Docker/Local: Try to use real sharp if available
 * 
 * IMPORTANT: Do NOT import 'sharp' directly anywhere in your code.
 * Always import from this file: import { withSharp, getSharp } from '@/libs/sharp'
 */

import debug from 'debug';

const log = debug('lobe:sharp-wrapper');

// Detect if we're in a serverless environment
const isServerlessEnvironment = (): boolean => {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL) ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.NEXT_RUNTIME === 'experimental-edge'
  );
};

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Cache for the sharp module
let sharpModule: any = null;

/**
 * Get the sharp module
 * In serverless: returns the safe mock
 * In Node.js: tries to load real sharp, falls back to mock
 */
async function getSharpModule(): Promise<any> {
  if (sharpModule) return sharpModule;
  
  if (isBrowser || isServerlessEnvironment()) {
    // In browser or serverless, use the safe mock
    log('Using sharp safe mock');
    const { default: safeSharp } = await import('./sharp.safe');
    sharpModule = safeSharp;
    return sharpModule;
  }
  
  // In Node.js (Docker, local), try to load real sharp
  try {
    // IMPORTANT: We use a dynamic import here to avoid Turbopack issues
    // The webpack alias in next.config.ts will replace this with sharp.safe.ts
    // in Vercel, but in local Docker it should load the real sharp
    const sharp = await import('sharp');
    sharpModule = sharp.default || sharp;
    log('Loaded real sharp module');
    return sharpModule;
  } catch (error) {
    log('Failed to load real sharp, using mock:', error);
    // Fallback to safe mock
    const { default: safeSharp } = await import('./sharp.safe');
    sharpModule = safeSharp;
    return sharpModule;
  }
}

/**
 * Get sharp instance
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
 * Check if real sharp is available (not in serverless)
 */
export async function isSharpAvailable(): Promise<boolean> {
  if (isBrowser || isServerlessEnvironment()) return false;
  try {
    await import('sharp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe wrapper for sharp operations
 * Always returns a result (mock or real)
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
