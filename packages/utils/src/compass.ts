import brotliPromise from 'brotli-wasm';

/**
 * @title String Compressor
 */
export class StrCompressor {
  /**
   * @ignore
   */
  private instance!: {
    compress: (buf: Uint8Array, options?: any) => Uint8Array;
    decompress: (buf: Uint8Array) => Uint8Array;
  };

  async init(): Promise<void> {
    this.instance = await brotliPromise; // Import is async in browsers due to wasm requirements!
  }

  /**
   * @title Compress string
   * @param str - String to compress
   * @returns Compressed string
   */
  compress(str: string): string {
    const input = new TextEncoder().encode(str);

    const compressedData = this.instance.compress(input);

    return this.urlSafeBase64Encode(compressedData);
  }

  /**
   * @title Decompress string
   * @param str - String to decompress
   * @returns Decompressed string
   */
  decompress(str: string): string {
    const compressedData = this.urlSafeBase64Decode(str);

    const decompressedData = this.instance.decompress(compressedData);

    return new TextDecoder().decode(decompressedData);
  }

  /**
   * @title Compress string asynchronously
   * @param str - String to compress
   * @returns Promise
   */
  async compressAsync(str: string) {
    const brotli = await brotliPromise;

    const input = new TextEncoder().encode(str);

    const compressedData = brotli.compress(input);

    return this.urlSafeBase64Encode(compressedData);
  }

  /**
   * @title Decompress string asynchronously
   * @param str - String to decompress
   * @returns Promise
   */
  async decompressAsync(str: string) {
    const brotli = await brotliPromise;

    const compressedData = this.urlSafeBase64Decode(str);

    const decompressedData = brotli.decompress(compressedData);

    return new TextDecoder().decode(decompressedData);
  }

  private urlSafeBase64Encode = (data: Uint8Array): string => {
    let str = '';
    const chunk = 8192;
    for (let i = 0; i < data.length; i += chunk) {
      const arr = Array.from(data.subarray(i, i + chunk));
      str += String.fromCharCode.apply(null, arr);
    }
    const base64Str = btoa(str);
    return base64Str.replaceAll('+', '_0_').replaceAll('/', '_').replace(/=+$/, '');
  };

  private urlSafeBase64Decode = (data: string): Uint8Array => {
    let after = data.replaceAll('_0_', '+').replaceAll('_', '/');
    while (after.length % 4) {
      after += '=';
    }

    const binaryStr = atob(after);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  };
}

export const Compressor = new StrCompressor();
