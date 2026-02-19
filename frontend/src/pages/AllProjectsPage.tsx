import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../services/api';
import { logger } from '../lib/logger';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import type { PortfolioItem } from '../types/portfolio';

export default function AllProjectsPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);

      const result = await portfolioService.getAllWithPosts({
        page,
        limit: 12,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      setItems(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      setAvailableTags(result.filters.tags);
    } catch (error) {
      logger.error('Error loading items', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedTags]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const getItemLink = (item: PortfolioItem) => {
    return item.type === 'post' ? `/page/${item.slug}` : `/project/${item.id}`;
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-[1800px] mx-auto px-6 py-24">
            <div className="text-center text-zinc-600">Завантаження...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="pt-20">
        <div className="max-w-[1800px] mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Проєкти</h1>
            <p className="text-zinc-600 text-lg">
              {total} {total === 1 ? 'запис' : total > 1 && total < 5 ? 'записи' : 'записів'}
            </p>
          </div>

          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-4 py-2 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-700 cursor-pointer"
                >
                  Скинути
                </button>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-24 text-zinc-600">Немає результатів</div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 mb-16">
                {items.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={getItemLink(item)}
                    className="group block space-y-4 break-inside-avoid mb-6"
                  >
                    <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100">
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
                      <Icon
                        icon="solar:arrow-right-linear"
                        width={20}
                        className="-rotate-45 group-hover:rotate-0 transition-transform"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-zinc-200 rounded-full hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer"
                  >
                    Попередня
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-full transition-all duration-200 text-sm font-medium cursor-pointer ${
                          page === pageNum
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                            : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-zinc-200 rounded-full hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer"
                  >
                    Наступна
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
