import { useState, useCallback } from 'react';

export interface BlockWithFile {
  id: string;
  file: File | null;
}

export function usePostFiles() {
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [blockFiles, setBlockFiles] = useState<BlockWithFile[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);

  const handleBlockImageChange = useCallback(
    (blockId: string, file: File | null, field?: string) => {
      const key = field ? `${blockId}__${field}` : blockId;
      setBlockFiles((prev) => {
        const existing = prev.find((bf) => bf.id === key);
        if (existing) {
          return prev.map((bf) => (bf.id === key ? { ...bf, file } : bf));
        }
        return [...prev, { id: key, file }];
      });
    },
    []
  );

  return {
    ogImageFile,
    setOgImageFile,
    blockFiles,
    galleryNewFiles,
    setGalleryNewFiles,
    handleBlockImageChange,
  };
}
