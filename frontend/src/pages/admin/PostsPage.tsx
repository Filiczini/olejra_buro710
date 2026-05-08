import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, ChevronDown, PlusCircle, Pencil, Eye, Trash2, CheckCircle, X } from 'lucide-react';
import type { PostStatus, Post } from '@buro710/shared';
import { postService } from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import type { ColumnDef } from '../../components/admin/DataTable';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function PostsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, dismissToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const previousPostsRef = useRef<Post[]>([]);
  const previousPaginationRef = useRef(pagination);

  useEffect(() => {
    if (location.state?.saved) {
      showToast('Пост збережено', 'success');
      navigate('/admin/posts', { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const postCountLabel = (n: number) => {
    if (n === 1) return '1 пост';
    if (n >= 2 && n <= 4) return `${n} пости`;
    return `${n} постів`;
  };

  const loadPosts = useCallback(
    async (page: number) => {
      setLoading(true);
      setSelectedIds(new Set());
      try {
        const result = await postService.getAll({
          page,
          limit: DEFAULT_LIMIT,
          status: statusFilter || undefined,
          search: searchQuery || undefined,
        });
        setPosts(result.data);
        setPagination((prev) => ({
          ...prev,
          page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }));
      } catch (error) {
        logger.error('Error loading posts', error);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchQuery]
  );

  useEffect(() => {
    loadPosts(pagination.page);
  }, [loadPosts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        loadPosts(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    previousPostsRef.current = posts;
    previousPaginationRef.current = pagination;

    setPosts((prev) => prev.filter((p) => p.id !== id));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await postService.delete(id);
    } catch (error) {
      logger.error('Error deleting post', error);
      setPosts(previousPostsRef.current);
      setPagination(previousPaginationRef.current);
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => postService.delete(id)));
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - ids.length) }));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (error) {
      logger.error('Error bulk deleting posts', error);
      loadPosts(pagination.page);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: PostStatus) => {
    setStatusDropdownOpen(false);
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => {
          const fd = new FormData();
          fd.append('status', status);
          return postService.update(id, fd);
        })
      );
      setPosts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status } : p)));
      setSelectedIds(new Set());
    } catch (error) {
      logger.error('Error bulk updating status', error);
      loadPosts(pagination.page);
    } finally {
      setBulkLoading(false);
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

  const postColumns: ColumnDef<Post>[] = [
    {
      key: 'title',
      header: 'Назва',
      cell: (post) =>
        post.status === 'published' ? (
          <a
            href={`/page/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </a>
        ) : (
          <Link
            to={`/admin/posts/edit/${post.id}`}
            className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        ),
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (post) => (
        <code className="text-sm font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          /{post.slug}
        </code>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      cell: (post) => getStatusBadge(post.status),
    },
    {
      key: 'featured',
      header: 'Обране',
      cell: (post) =>
        post.featured ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Так
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: 'seo',
      header: 'SEO',
      cell: (post) =>
        post.seo_title || post.seo_description ? (
          <div className="flex items-center text-emerald-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1.5 stroke-[1.5]" />
            Налаштовано
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Не налаштовано</span>
        ),
    },
    {
      key: 'created',
      header: 'Створено',
      cell: (post) => (
        <span className="text-base text-gray-500 tabular-nums">{formatDate(post.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="text-right block">Дії</span>,
      cell: (post) => (
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
            onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title="Видалити"
          >
            <Trash2 className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
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

              <span className="text-sm text-gray-500 ml-2 font-medium">
                Всього: {pagination.total}
              </span>
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

        <DataTable
          data={posts}
          columns={postColumns}
          rowKey={(post) => post.id}
          rowSelectable
          selectedIds={[...selectedIds]}
          onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
          isLoading={loading}
          emptyMessage="Постів не знайдено"
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            limit: pagination.limit,
            onPageChange: (page) => loadPosts(page),
          }}
        />
      </div>
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
          <span className="text-sm font-medium">{postCountLabel(selectedIds.size)} обрано</span>
          <div className="w-px h-5 bg-zinc-700" />

          <div className="relative">
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => setStatusDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Змінити статус
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {statusDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 bg-white text-zinc-900 rounded-lg shadow-lg overflow-hidden min-w-36">
                <button
                  type="button"
                  onClick={() => handleBulkStatusChange('published')}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Опублікувати
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatusChange('draft')}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  В чернетку
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={bulkLoading}
            onClick={() => setBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Видалити
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Зняти виділення"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Підтвердження видалення"
        message={
          <>
            Видалити{' '}
            <span className="font-medium text-zinc-900">{postCountLabel(selectedIds.size)}</span>?{' '}
            Цю дію не можна скасувати.
          </>
        }
        confirmText={bulkLoading ? 'Видалення...' : `Видалити ${postCountLabel(selectedIds.size)}`}
        isLoading={bulkLoading}
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Підтвердження видалення"
        message={
          <>
            Видалити <span className="font-medium text-zinc-900">«{deleteTarget?.title}»</span>? Цю
            дію не можна скасувати.
          </>
        }
        confirmText="Видалити"
        variant="danger"
      />
    </div>
  );
}
