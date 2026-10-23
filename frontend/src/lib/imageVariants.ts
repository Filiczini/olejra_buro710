const VARIANT_WIDTHS = [400, 1000] as const;
const FULL_WIDTH = 2000;
const UPLOAD_IMAGE = /\/uploads\/.+\.(jpe?g|png|webp)$/i;

/**
 * Builds a srcset for an uploaded image. The backend stores `<name>-400.webp` and
 * `<name>-1000.webp` next to every upload; other URLs get no srcset.
 */
export function getImageSrcSet(url: string | null | undefined): string | undefined {
  if (!url || !UPLOAD_IMAGE.test(url)) return undefined;
  const base = url.replace(/\.[^./]+$/, '');
  return [...VARIANT_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`), `${url} ${FULL_WIDTH}w`].join(
    ', '
  );
}
