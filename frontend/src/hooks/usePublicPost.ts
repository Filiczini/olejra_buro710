import { useState, useEffect } from 'react';
import { postService } from '../services/api';
import { logger } from '../lib/logger';
import type { Post, Block } from '@buro710/shared';

export interface UsePublicPostReturn {
  post: Post | null;
  blocks: Block[];
  loading: boolean;
  error: boolean;
}

export function usePublicPost(slug: string | undefined): UsePublicPostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadPost(postSlug: string) {
      setLoading(true);
      setError(false);
      try {
        const result = await postService.getBySlug(postSlug);
        if (!cancelled) {
          setPost(result.post);
          setBlocks(result.blocks);
        }
      } catch (err) {
        if (!cancelled) {
          logger.error('Error loading post', err);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPost(slug);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, blocks, loading, error };
}
