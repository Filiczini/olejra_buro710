import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, PlusCircle, Pencil, Eye, Trash2, CheckCircle } from 'lucide-react';
import { postService } from '../../services/api';
import type { Post } from '../../types/post';

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          Опубліковано
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
        Чернетка
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl ">
        {/* Toolbar */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative group w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  placeholder="Пошук постів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all bg-white"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'draft' | 'published' | '')}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="">Всі статуси</option>
                  <option value="published">Опубліковано</option>
                  <option value="draft">Чернетка</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown className="h-4 w-4 stroke-[1.5]" />
                </div>
              </div>

              <span className="text-sm text-gray-500 ml-2 font-medium">Всього: {pagination.total}</span>
            </div>

            <button
              onClick={() => navigate('/admin/posts/create')}
              className="flex items-center justify-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 cursor-pointer"
            >
              <PlusCircle className="h-5 w-5 mr-2 stroke-[1.5]" />
              Додати пост
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">Назва</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">Статус</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">SEO</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">Створено</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Завантаження...</td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Постів не знайдено</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="text-base font-medium text-gray-900">{post.title}</p>
                      </td>
                      <td className="py-4 px-6">
                        <code className="text-sm font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">/{post.slug}</code>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="py-4 px-6">
                        {post.seo_title || post.seo_description ? (
                          <div className="flex items-center text-emerald-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 mr-1.5 stroke-[1.5]" />
                            Налаштовано
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Не налаштовано</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-base text-gray-500 tabular-nums">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Редагувати"
                          >
                            <Pencil className="h-5 w-5 stroke-[1.5]" />
                          </button>
                          {post.status === 'published' && (
                            <a
                              href={`/page/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                              title="Перегляд"
                            >
                              <Eye className="h-5 w-5 stroke-[1.5]" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Видалити"
                          >
                            <Trash2 className="h-5 w-5 stroke-[1.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Показано {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} з {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
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
                      className={`px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm ${
                        page === pagination.page ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800' : ''
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
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
