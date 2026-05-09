import { useState, useEffect, useRef } from 'react';
import { logger } from '../../lib/logger';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Pencil, Eye, Trash2, CheckCircle, ChevronDown, X } from 'lucide-react';
import type { PostStatus, Post } from '@buro710/shared';
import { postService } from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import type { ColumnDef } from '../../components/admin/DataTable';
import PostsToolbar from '../../components/admin/PostsToolbar';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAdminListPage } from '../../hooks/useAdminListPage';
import { formatDate } from '../../lib/date';

export default function PostsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, dismissToast } = useToast();

  const {
    data: posts,
    setData: setPosts,
    loading,
    pagination,
    filters,
    setFilter,
    setPage,
    refresh,
  } = useAdminListPage<Post, { status?: string; search?: string }>({
    fetchData: (params) => postService.getAll(params),
    defaultLimit: 10,
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const previousPostsRef = useRef<Post[]>([]);
  const previousPaginationRef = useRef(pagination);

  useEffect(() => {
    if (location.state?.saved) {
      showToast('Пост збережено', 'success');
      navigate('/admin/posts', { replace: true, state: {} });
    }
  }, [location.state?.saved, showToast, navigate]);

  const postCountLabel = (n: number) => {
    if (n === 1) return '1 пост';
    if (n >= 2 && n <= 4) return `${n} пости`;
    return `${n} постів`;
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    previousPostsRef.current = posts;
    previousPaginationRef.current = pagination;

    setPosts((prev) => prev.filter((p) => p.id !== id));

    try {
      await postService.delete(id);
    } catch (error) {
      logger.error('Error deleting post', error);
      setPosts(previousPostsRef.current);
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => postService.delete(id)));
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (error) {
      logger.error('Error bulk deleting posts', error);
      refresh();
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
      refresh();
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
      <div className="mx-auto max-w-7xl">
        <PostsToolbar
          searchQuery={filters.search || ''}
          onSearchChange={(value) => {
            setSelectedIds(new Set());
            setFilter('search', value || undefined);
          }}
          statusFilter={(filters.status as 'draft' | 'published' | '') || ''}
          onStatusChange={(value) => {
            setSelectedIds(new Set());
            setFilter('status', value || undefined);
          }}
          total={pagination.total}
          onAddClick={() => navigate('/admin/posts/create')}
        />

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
            onPageChange: (page) => {
              setSelectedIds(new Set());
              setPage(page);
            },
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
