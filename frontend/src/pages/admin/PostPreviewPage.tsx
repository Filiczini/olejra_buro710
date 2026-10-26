import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import type { Post, Block } from '@buro710/shared';
import { postService } from '../../services/api';
import { logger } from '../../lib/logger';
import PostPageView from '../../components/blocks/PostPageView';

export default function PostPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ post: Post; blocks: Block[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load(postId: string) {
      setLoading(true);
      setError(false);
      try {
        const result = await postService.getById(postId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          logger.error('Error loading post preview', err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(id);
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Icon icon="solar:file-remove-linear" width={64} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-700 mb-2">Сторінку не знайдено</h1>
      </div>
    );
  }

  const isDraft = data.post.status !== 'published';

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-zinc-900 text-white text-sm shadow-lg">
        Режим перегляду · {isDraft ? 'чернетка' : 'опубліковано'}
      </div>
      <PostPageView post={data.post} blocks={data.blocks} />
    </>
  );
}
