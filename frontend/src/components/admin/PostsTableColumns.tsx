import { useMemo } from 'react';
import { Link, type NavigateFunction } from 'react-router-dom';
import { Pencil, Eye, Trash2, CheckCircle } from 'lucide-react';
import type { Post } from '@buro710/shared';
import type { ColumnDef } from '../../components/admin/DataTable';
import { formatDate } from '../../lib/date';

function getStatusBadge(status: string) {
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
}

export function usePostsColumns(
  navigate: NavigateFunction,
  setDeleteTarget: (target: { id: string; title: string } | null) => void
): ColumnDef<Post>[] {
  return useMemo<ColumnDef<Post>[]>(
    () => [
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
          <span className="text-base text-gray-500 tabular-nums">
            {formatDate(post.created_at)}
          </span>
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
              aria-label="Редагувати пост"
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
                aria-label="Переглянути пост"
              >
                <Eye className="h-5 w-5 stroke-[1.5]" />
              </a>
            )}
            <button
              onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Видалити"
              aria-label="Видалити пост"
            >
              <Trash2 className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, setDeleteTarget]
  );
}
