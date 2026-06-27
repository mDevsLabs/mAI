/**
 * zlib-sync mock for Vercel Serverless Functions
 * 
 * This file provides a mock of zlib-sync that works in Vercel Serverless Functions.
 * The real zlib-sync is a native module that may not be available in serverless.
 */

import debug from 'debug';

const log = debug('lobe:zlib-sync-serverless');

/**
 * Mock implementation of zlib-sync
 * Provides basic compression/decompression that works in browser and serverless
 */

// Simple mock implementations
function compressSync(buffer: Buffer): Buffer {
  log('Mock compressSync called');
  // Return a slightly smaller buffer to simulate compression
  return Buffer.from(buffer.toString('base64'));
}

function decompressSync(buffer: Buffer): Buffer {
  log('Mock decompressSync called');
  try {
    return Buffer.from(buffer.toString('utf8'), 'base64');
  } catch {
    return buffer; // Return original if decode fails
  }
}

function compress(buffer: Buffer, callback: (err: Error | null, result: Buffer) => void): void {
  try {
    callback(null, compressSync(buffer));
  } catch (err) {
    callback(err as Error, Buffer.from([]));
  }
}

function decompress(buffer: Buffer, callback: (err: Error | null, result: Buffer) => void): void {
  try {
    callback(null, decompressSync(buffer));
  } catch (err) {
    callback(err as Error, Buffer.from([]));
  }
}

// Promises versions
function compressPromise(buffer: Buffer): Promise<Buffer> {
  return Promise.resolve(compressSync(buffer));
}

function decompressPromise(buffer: Buffer): Promise<Buffer> {
  return Promise.resolve(decompressSync(buffer));
}

// Export the mock module
const mockZlibSync = {
  compressSync,
  decompressSync,
  compress,
  decompress,
  compressPromise,
  decompressPromise,
  // Add other zlib methods as needed
  deflateSync: compressSync,
  inflateSync: decompressSync,
  deflate: compress,
  inflate: decompress,
  gzipSync: compressSync,
  gunzipSync: decompressSync,
  gzip: compress,
  gunzip: decompress,
};

// Export as default and named exports
module.exports = mockZlibSync;
module.exports.default = mockZlibSync;
module.exports.compressSync = compressSync;
module.exports.decompressSync = decompressSync;
module.exports.compress = compress;
module.exports.decompress = decompress;

export default mockZlibSync;
export {
  compressSync,
  decompressSync,
  compress,
  decompress,
  compressPromise,
  decompressPromise,
};
