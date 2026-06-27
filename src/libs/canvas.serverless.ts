/**
 * @napi-rs/canvas mock for Vercel Serverless Functions
 * 
 * This file provides a complete mock of the @napi-rs/canvas module that works in
 * Vercel Serverless Functions where native modules are not available.
 */

import debug from 'debug';

const log = debug('lobe:canvas-serverless');

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
    process.env.FUNCTIONS_WORKER_RUNTIME !== undefined
  );
};

/**
 * Mock Canvas class
 * Provides a minimal interface that mimics @napi-rs/canvas
 */
class MockCanvas {
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    log('Created mock canvas:', { width, height });
  }
  
  getContext(type: string) {
    return {
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '10px sans-serif',
      textAlign: 'left',
      textBaseline: 'top',
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: (text: string) => ({ width: text.length * 10 }),
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      clearRect: () => {},
      fill: () => {},
      clip: () => {},
    };
  }
  
  toBuffer() {
    // Return a mock PNG buffer
    return Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
  }
  
  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}

/**
 * Mock Image class
 */
class MockImage {
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

/**
 * Mock GlobalFonts
 */
const GlobalFonts = {
  register: () => {},
  registerFromPath: () => {},
  registerFromUrl: () => {},
  getFont: () => null,
};

/**
 * Mock loadImage
 */
async function loadImage(_src: string | Buffer | Uint8Array) {
  return new MockImage(100, 100);
}

/**
 * Mock canvas module
 */
const mockCanvas = {
  Canvas: MockCanvas,
  Image: MockImage,
  GlobalFonts,
  loadImage,
  createCanvas: (width: number, height: number) => new MockCanvas(width, height),
  default: MockCanvas,
};

// Export as default and named exports
module.exports = mockCanvas;
module.exports.default = mockCanvas;
module.exports.Canvas = MockCanvas;
module.exports.Image = MockImage;
module.exports.GlobalFonts = GlobalFonts;
module.exports.loadImage = loadImage;
module.exports.createCanvas = mockCanvas.createCanvas;

export default mockCanvas;
export { MockCanvas as Canvas, MockImage as Image, GlobalFonts, loadImage, mockCanvas as createCanvas };
