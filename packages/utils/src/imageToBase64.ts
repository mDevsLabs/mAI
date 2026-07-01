import { Buffer } from 'buffer.js';

import { resolveMimeTypeFromBytes } from './imageMimeType';

export const imageToBase64 = ({
  size,
  img,
  type = 'image/webp',
}: {
  img: HTMLImageElement;
  size: number;
  type?: string;
}) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  let startX = 0;
  let startY = 0;

  if (img.width > img.height) {
    startX = (img.width - img.height) / 2;
  } else {
    startY = (img.height - img.width) / 2;
  }

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    img,
    startX,
    startY,
    Math.min(img.width, img.height),
    Math.min(img.width, img.height),
    0,
    0,
    size,
    size,
  );

  return canvas.toDataURL(type);
};

/**
 * Convert image URL to base64
 * Uses SSRF-safe fetch on server-side to prevent SSRF attacks
 */
export const imageUrlToBase64 = async (
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> => {
  try {
    const isServer = typeof window === 'undefined';

    // Use SSRF-safe fetch on server-side to prevent SSRF attacks
    const res = isServer
      ? await import('@lobechat/ssrf-safe-fetch').then((m) => m.ssrfSafeFetch(imageUrl))
      : await fetch(imageUrl);

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const mimeType = await resolveMimeTypeFromBytes(blob.type, arrayBuffer);

    // Client-side uses btoa, server-side uses Buffer
    let base64 = '';
    if (isServer) {
      base64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
      }
      base64 = btoa(binary);
    }

    return { base64, mimeType };
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};
