const MAX_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_DIMENSION = 2560;
const QUALITIES = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

function fmtMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Cannot load image'));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality
    )
  );
}

async function tryQualities(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
): Promise<Blob | null> {
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  for (const q of QUALITIES) {
    const blob = await toBlob(canvas, q);
    if (blob.size <= MAX_BYTES) return blob;
  }
  return null;
}

/**
 * Compresses a File to ≤ 1 MB using Canvas API.
 * - Images already ≤ 1 MB are returned unchanged.
 * - Dimensions are capped at 2560 px on the longest side (never upscaled).
 * - Quality is reduced 0.9 → 0.1 until the target is met.
 * - Fallback: halve dimensions and retry.
 * - Output format is always JPEG.
 *
 * @param onProgress  Called with a status string during and after compression.
 */
export async function compressImage(
  file: File,
  onProgress?: (message: string) => void
): Promise<File> {
  if (file.size <= MAX_BYTES) return file;

  const originalSize = file.size;
  onProgress?.(`Стискаємо ${fmtMb(originalSize)}...`);

  const img = await loadImg(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    if (w >= h) {
      h = Math.round((h * MAX_DIMENSION) / w);
      w = MAX_DIMENSION;
    } else {
      w = Math.round((w * MAX_DIMENSION) / h);
      h = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  let blob = await tryQualities(canvas, ctx, img, w, h);

  // Fallback: halve dimensions and retry
  if (!blob) {
    blob = await tryQualities(canvas, ctx, img, Math.ceil(w / 2), Math.ceil(h / 2));
  }

  // Absolute last resort: minimum quality at current size
  if (!blob) {
    blob = await toBlob(canvas, 0.1);
  }

  const baseName = file.name.replace(/\.[^.]+$/, '');
  const compressed = new File([blob!], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  onProgress?.(`${fmtMb(originalSize)} → ${fmtMb(compressed.size)}`);
  return compressed;
}
