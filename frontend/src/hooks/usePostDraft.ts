import { useState, useRef, useCallback } from 'react';
import type { EditBlock } from '../types/block';
import type { PostStatus } from '@buro710/shared';

export interface DraftData {
  title: string;
  slug: string;
  slugLocked: boolean;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  heroData: {
    hero_image_url: string;
    hero_title: string;
    hero_subtitle: string;
    hero_tags: string[];
    hero_location: string;
    hero_year: string;
  };
  blocks: EditBlock[];
  galleryImages: string[];
  savedAt: string;
}

function readDraft(draftKey: string): DraftData | null {
  try {
    const saved = localStorage.getItem(draftKey);
    return saved ? (JSON.parse(saved) as DraftData) : null;
  } catch {
    return null;
  }
}

export function usePostDraft(draftKey: string) {
  // Lazy initializer reads localStorage during first render — avoids calling
  // setState inside an effect which triggers cascading renders.
  const [initData] = useState<DraftData | null>(() => readDraft(draftKey));
  const [banner, setBanner] = useState<{ savedAt: string } | null>(
    initData ? { savedAt: initData.savedAt } : null
  );
  const dataRef = useRef<DraftData | null>(initData);

  const save = useCallback(
    (snapshot: Omit<DraftData, 'savedAt'>) => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() })
        );
      } catch {
        // ignore localStorage quota errors
      }
    },
    [draftKey]
  );

  const dismiss = useCallback(() => {
    localStorage.removeItem(draftKey);
    dataRef.current = null;
    setBanner(null);
  }, [draftKey]);

  return { banner, dataRef, save, dismiss };
}
