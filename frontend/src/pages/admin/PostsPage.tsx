import { useState, useEffect, useRef } from 'react';
import { logger } from '../../lib/logger';
import { useNavigate, useLocation } from 'react-router-dom';
import type { PostStatus, Post } from '@buro710/shared';
import { postService } from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import PostsToolbar from '../../components/admin/PostsToolbar';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAdminListPage } from '../../hooks/useAdminListPage';
import { usePostsColumns } from '../../components/admin/PostsTableColumns';
import BulkActionsBar from '../../components/admin/BulkActionsBar';

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
  } = useAdminListPage<Post, { status?: PostStatus; search?: string }>({
    fetchData: (params) => postService.getAll(params),
    defaultLimit: 10,
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
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

  const postColumns = usePostsColumns(navigate, setDeleteTarget);

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

      <BulkActionsBar
        selectedIds={selectedIds}
        postCountLabel={postCountLabel}
        onStatusChange={handleBulkStatusChange}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
        onClearSelection={() => setSelectedIds(new Set())}
        bulkLoading={bulkLoading}
      />

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
