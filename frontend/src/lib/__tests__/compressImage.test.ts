import { describe, it, expect, vi, afterEach } from 'vitest';
import { compressImage } from '../compressImage';

class FakeImage {
  naturalWidth: number;
  naturalHeight: number;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(width: number, height: number) {
    this.naturalWidth = width;
    this.naturalHeight = height;
  }

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

interface FakeCanvasOptions {
  blobSizes: number[];
}

function installFakeCanvas({ blobSizes }: FakeCanvasOptions) {
  let call = 0;
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: (cb: (blob: Blob | null) => void, type: string) => {
      const size = blobSizes[Math.min(call, blobSizes.length - 1)];
      call += 1;
      cb(new Blob([new Uint8Array(size)], { type }));
    },
  };
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return canvas as unknown as HTMLCanvasElement;
    return originalCreateElement(tag);
  });
  return canvas;
}

function bigFile(name: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'image/png' });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('compressImage', () => {
  it('returns the original file unchanged when already under the 1 MB limit', async () => {
    const original = bigFile('small.jpg', 500 * 1024);
    const onProgress = vi.fn();

    const result = await compressImage(original, onProgress);

    expect(result).toBe(original);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('compresses an oversized image to a JPEG under the limit, reporting progress', async () => {
    const oneMb = 1024 * 1024;
    vi.stubGlobal(
      'Image',
      class extends FakeImage {
        constructor() {
          super(1200, 900);
        }
      }
    );
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn(),
    });
    // First quality attempt is still too big, second one fits.
    installFakeCanvas({ blobSizes: [oneMb * 1.5, oneMb * 0.5] });

    const original = bigFile('photo.png', 3 * oneMb);
    const onProgress = vi.fn();

    const result = await compressImage(original, onProgress);

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('photo.jpg');
    expect(result.size).toBeLessThanOrEqual(oneMb);
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, expect.stringContaining('Стискаємо'));
    expect(onProgress).toHaveBeenNthCalledWith(2, expect.stringContaining('→'));
  });

  it('caps dimensions at 2560px on the longest side, preserving aspect ratio', async () => {
    const oneMb = 1024 * 1024;
    vi.stubGlobal(
      'Image',
      class extends FakeImage {
        constructor() {
          super(5120, 2560); // 2:1, longest side 5120
        }
      }
    );
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn(),
    });
    const canvas = installFakeCanvas({ blobSizes: [oneMb * 0.5] });

    await compressImage(bigFile('wide.png', 3 * oneMb));

    expect(canvas.width).toBe(2560);
    expect(canvas.height).toBe(1280);
  });
});
