import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { portfolioService } from '../../services/api';
import type { PortfolioItem } from '../../types/portfolio';

export default function FeaturedProjectsSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await portfolioService.getAllWithPosts({ limit: 6 });
        setItems(response.data);
      } catch (err) {
        console.error('Failed to load featured items:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const getItemLink = (item: PortfolioItem) => {
    return item.type === 'post' ? `/page/${item.slug}` : `/project/${item.id}`;
  };

  if (loading) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            Вибрані проєкти
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          Завантаження...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            Вибрані проєкти
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          Не вдалося завантажити
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            Вибрані проєкти
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          Немає проєктів
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-40">
      <div className="flex justify-between items-end mb-16 pb-6 gap-12">
        <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
          Вибрані проєкти
        </h2>
        <Link
          to="/projects"
          className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Всі проєкти
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            to={getItemLink(item)}
            className="group block"
          >
            <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-zinc-100">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Icon icon="solar:image-linear" width={48} />
                </div>
              )}
              {item.type === 'post' && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-zinc-700">
                  Стаття
                </div>
              )}
            </div>
            <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
              <div>
                <h4 className="text-lg font-medium text-zinc-900">{item.title}</h4>
                <p className="text-sm text-zinc-500 mt-1">
                  {item.location} {item.year && `· ${item.year}`}
                </p>
              </div>
              <Icon icon="solar:arrow-right-linear" width={20} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
