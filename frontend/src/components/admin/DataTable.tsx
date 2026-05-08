import { ReactNode } from 'react';
import Pagination from './Pagination';

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  width?: string;
}

interface PaginationConfig {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: 'danger' | 'primary';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T) => string;
  bulkActions?: BulkAction[];
  rowSelectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  pagination?: PaginationConfig;
  header?: ReactNode;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Дані відсутні',
  rowKey,
  bulkActions,
  rowSelectable = false,
  selectedIds = [],
  onSelectionChange,
  pagination,
  header,
  className = '',
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(rowKey(row)));
  const someSelected = data.some((row) => selectedIds.includes(rowKey(row)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row) => rowKey(row)));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const colSpan = columns.length + (rowSelectable ? 1 : 0);

  return (
    <div className={`w-full bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {header && <div>{header}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {rowSelectable && (
                <th className="py-4 pl-6 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-zinc-900 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8 text-gray-500">
                  Завантаження...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = rowKey(row);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={`group hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-zinc-50' : ''}`}
                  >
                    {rowSelectable && (
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(id)}
                          className="w-4 h-4 rounded border-gray-300 text-zinc-900 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="py-4 px-6">
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination {...pagination} />}

      {rowSelectable && bulkActions && selectedIds.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{selectedIds.length} обрано</span>
          <div className="w-px h-5 bg-gray-300" />
          {bulkActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => action.onClick(selectedIds)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                action.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : action.variant === 'primary'
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
