import { Icon } from '@iconify-icon/react';
import type { Post, Block } from '@buro710/shared';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import PostHeroBlock from './PostHeroBlock';
import BlockRenderer from './BlockRenderer';
import PostGalleryBlock from './PostGalleryBlock';

interface PostPageViewProps {
  post: Post;
  blocks: Block[];
}

export default function PostPageView({ post, blocks }: PostPageViewProps) {
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
