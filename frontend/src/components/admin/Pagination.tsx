interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Показано {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} з {total}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
          aria-label="Попередня сторінка"
        >
          Попередня
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = Math.max(1, page - 2) + i;
          if (p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm ${
                p === page ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800' : ''
              }`}
              aria-label={`Сторінка ${p}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
          aria-label="Наступна сторінка"
        >
          Наступна
        </button>
      </div>
    </div>
  );
}
