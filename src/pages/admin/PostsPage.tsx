import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../services/api';
import type { Post } from '../../types/post';
import Button from '../../components/ui/Button';

export default function PostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const previousPostsRef = useRef<Post[]>([]);
  const previousPaginationRef = useRef(pagination);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await postService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setPosts(result.data);
      setPagination(prev => ({ ...prev, total: result.pagination.total, totalPages: result.pagination.totalPages }));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadPosts();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей пост?')) return;

    previousPostsRef.current = posts;
    previousPaginationRef.current = pagination;

    setPosts(prev => prev.filter(p => p.id !== id));
    setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await postService.delete(id);
    } catch (error) {
      console.error('Error deleting post:', error);
      setPosts(previousPostsRef.current);
      setPagination(previousPaginationRef.current);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          Опубліковано
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
        Чернетка
      </span>
    );
  };

  return (
    <div>
      <div className="max-w-7xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Пошук постів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 w-64"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'draft' | 'published' | '')}
                className="px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Всі статуси</option>
                <option value="published">Опубліковані</option>
                <option value="draft">Чернетки</option>
              </select>

              <span className="text-zinc-600">
                Всього постів: {pagination.total}
              </span>
            </div>
            <Button onClick={() => navigate('/admin/posts/create')}>
              Додати пост
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Назва</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Slug</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">SEO</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Створено</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-600">Завантаження...</td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-600">Постів не знайдено</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900">{post.title}</td>
                      <td className="py-3 px-4 text-zinc-500 font-mono text-sm">/{post.slug}</td>
                      <td className="py-3 px-4">{getStatusBadge(post.status)}</td>
                      <td className="py-3 px-4">
                        {post.seo_title || post.seo_description ? (
                          <span className="text-green-600 text-sm">Налаштовано</span>
                        ) : (
                          <span className="text-zinc-400 text-sm">Не налаштовано</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {new Date(post.created_at).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Редагувати
                          </button>
                          {post.status === 'published' && (
                            <a
                              href={`/page/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 transition-colors"
                            >
                              Перегляд
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Видалити
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200">
              <div className="text-sm text-zinc-600">
                Показано {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} з {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Попередня
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const page = Math.max(1, pagination.page - 2) + i;
                  if (page > pagination.totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors ${
                        page === pagination.page ? 'bg-zinc-900 text-white' : ''
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Наступна
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
