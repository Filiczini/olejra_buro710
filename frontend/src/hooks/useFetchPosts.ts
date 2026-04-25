import { useQuery } from '@tanstack/react-query';
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
  const { featured, status, limit } = options;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', { featured, status, limit }],
    queryFn: featured
      ? () => postService.getFeatured()
      : () => postService.getAll({ status, limit }).then((res) => res.data),
  });

  return {
    posts: data ?? [],
    loading: isLoading,
    error: isError,
  };
}
