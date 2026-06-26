/**
 * Cross-platform base64 encoding utility
 * Works in both browser and Node.js environments
 */

import { Buffer } from 'buffer.js';

/**
 * Encode a string to base64
 * @param input - The string to encode
 * @returns Base64 encoded string
 */
export const encodeToBase64 = (input: string): string => {
  if (typeof btoa === 'function') {
    // Browser environment
    return btoa(input);
  } else {
    // Node.js environment
    return Buffer.from(input, 'utf8').toString('base64');
  }
};

/**
 * Decode a base64 string
 * @param input - The base64 string to decode
 * @returns Decoded string
 */
export const decodeFromBase64 = (input: string): string => {
  if (typeof atob === 'function') {
    // Browser environment
    return atob(input);
  } else {
    // Node.js environment
    return Buffer.from(input, 'base64').toString('utf8');
  }
};

/**
 * Create Basic Authentication header value
 * @param username - Username for authentication
 * @param password - Password for authentication
 * @returns Base64 encoded credentials for Basic auth
 */
export const createBasicAuthCredentials = (username: string, password: string): string => {
  return encodeToBase64(`${username}:${password}`);
};

/**
 * Fast arrayBuffer/Uint8Array to base64 encoding that avoids Maximum call stack size exceeded
 * by processing the array in chunks.
 *
 * @param data - The ArrayBuffer or Uint8Array to encode
 * @returns Base64 encoded string
 */
export const arrayBufferToBase64 = (data: ArrayBuffer | Uint8Array): string => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  // 8192 is a safe chunk size to prevent stack overflow in String.fromCharCode.apply
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    // @ts-ignore - Math.min helps, but TypeScript doesn't like apply with Uint8Array
    binary += String.fromCharCode.apply(null, chunk);
  }

  return encodeToBase64(binary);
};

/**
 * Fast base64 to Uint8Array decoding that avoids intermediate arrays
 * from string spreading (e.g. `[...str]`).
 *
 * @param base64 - The base64 string to decode
 * @returns Uint8Array of the decoded data
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = decodeFromBase64(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};
