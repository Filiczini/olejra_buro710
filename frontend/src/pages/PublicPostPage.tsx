import { useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { usePublicPost } from '../hooks/usePublicPost';
import { usePostSEO } from '../hooks/usePostSEO';
import PostPageView from '../components/blocks/PostPageView';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, blocks, loading, error } = usePublicPost(slug);
  usePostSEO(post);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Icon icon="solar:file-remove-linear" width={64} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-700 mb-2">Сторінку не знайдено</h1>
        <p className="text-zinc-500">Запитана сторінка не існує або була видалена.</p>
      </div>
    );
  }

  return <PostPageView post={post} blocks={blocks} />;
}
