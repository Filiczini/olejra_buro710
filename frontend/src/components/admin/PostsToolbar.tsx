import { Search, ChevronDown, PlusCircle } from 'lucide-react';

export interface PostsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'draft' | 'published' | '';
  onStatusChange: (value: 'draft' | 'published' | '') => void;
  total: number;
  onAddClick: () => void;
}

export default function PostsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  total,
  onAddClick,
}: PostsToolbarProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 stroke-[1.5]" />
            </div>
            <input
              type="text"
              placeholder="Пошук постів..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as 'draft' | 'published' | '')}
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

          <span className="text-sm text-gray-500 ml-2 font-medium">Всього: {total}</span>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5 mr-2 stroke-[1.5]" />
          Додати пост
        </button>
      </div>
    </div>
  );
}
