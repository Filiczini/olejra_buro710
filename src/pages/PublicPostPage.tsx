import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { postService } from '../services/api';
import BlockRenderer from '../components/blocks/BlockRenderer';
import type { Post } from '../types/post';
import type { Block } from '../types/block';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    setError(false);
    try {
      const result = await postService.getBySlug(postSlug);
      setPost(result.post);
      setBlocks(result.blocks);
      
      if (result.post.seo_title || result.post.seo_description) {
        document.title = result.post.seo_title || result.post.title;
        updateMetaTag('description', result.post.seo_description || '');
        updateMetaTag('og:title', result.post.seo_title || result.post.title);
        updateMetaTag('og:description', result.post.seo_description || '');
        if (result.post.og_image_url) {
          updateMetaTag('og:image', result.post.og_image_url);
        }
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (name.startsWith('og:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Icon icon="solar:file-remove-linear" width={64} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-700 mb-2">Сторінку не знайдено</h1>
        <p className="text-zinc-500">Запитана сторінка не існує або була видалена.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-24">
        <header className="mb-12 border-b border-zinc-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
            {post.title}
          </h1>
          <time className="text-sm text-zinc-500">
            {new Date(post.created_at).toLocaleDateString('uk-UA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        <main>
          <BlockRenderer blocks={blocks} />
        </main>
      </div>
    </div>
  );
}
