import { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { postService } from '../services/api';
import type { Post } from '../types/post';

interface UseFetchPostsOptions {
  featured?: boolean;
  status?: 'draft' | 'published';
  limit?: number;
}

interface UseFetchPostsResult {
  posts: Post[];
  loading: boolean;
  error: boolean;
}

export function useFetchPosts(options: UseFetchPostsOptions = {}): UseFetchPostsResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { featured, status, limit } = options;

  useEffect(() => {
    let cancelled = false;
    const fetchData = featured
      ? postService.getFeatured()
      : postService.getAll({ status, limit }).then((res) => res.data);

    fetchData
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.error('Failed to load posts', err);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [featured, status, limit]);

  return { posts, loading, error };
}
