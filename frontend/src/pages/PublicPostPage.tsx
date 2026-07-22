import { useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { usePublicPost } from '../hooks/usePublicPost';
import { usePostSEO } from '../hooks/usePostSEO';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PostHeroBlock from '../components/blocks/PostHeroBlock';
import BlockRenderer from '../components/blocks/BlockRenderer';
import PostGalleryBlock from '../components/blocks/PostGalleryBlock';

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

  const hasHero = Boolean(post.hero_image_url || post.hero_title);

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header transparent={hasHero} />

      {hasHero && <PostHeroBlock post={post} />}

      <main className={hasHero ? '' : 'pt-16'}>
        {blocks.length > 0 && <BlockRenderer blocks={blocks} />}

        {post.gallery_images && post.gallery_images.length > 0 && (
          <PostGalleryBlock images={post.gallery_images} title={post.title} />
        )}

        {!hasHero &&
          blocks.length === 0 &&
          !(post.gallery_images && post.gallery_images.length > 0) && (
            <div className="max-w-5xl mx-auto px-4 py-24">
              <div className="text-center text-zinc-400">
                <h1 className="text-2xl font-bold text-zinc-700 mb-4">{post.title}</h1>
                <Icon icon="solar:document-text-linear" width={48} className="mx-auto mb-4" />
                <p>Контент сторінки буде додано пізніше...</p>
              </div>
            </div>
          )}
      </main>
      <Footer />
    </div>
  );
}
