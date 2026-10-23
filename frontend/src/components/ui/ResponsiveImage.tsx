import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { getImageSrcSet } from '../../lib/imageVariants';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> {
  src: string;
  alt: string;
}

/** <img> that picks the smallest uploaded variant that fits `sizes`, falling back to `src` if a variant is missing. */
export default function ResponsiveImage({
  src,
  sizes,
  onError,
  decoding = 'async',
  ...rest
}: ResponsiveImageProps) {
  const [useSrcSet, setUseSrcSet] = useState(true);
  const srcSet = useSrcSet ? getImageSrcSet(src) : undefined;

  return (
    <img
      {...rest}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      decoding={decoding}
      onError={(e) => {
        if (srcSet) setUseSrcSet(false);
        onError?.(e);
      }}
    />
  );
}
