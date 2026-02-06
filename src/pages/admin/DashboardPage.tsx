import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/api';
import type { Project, FilterOptions, PaginationParams } from '../../types/project';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';
import Button from '../../components/ui/Button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<PaginationParams>({});
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ tags: [], locations: [], years: [] });
  const [showFilters, setShowFilters] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await portfolioService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      });
      setProjects(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const options = await portfolioService.getFilters();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [pagination.page, filters, sortBy, sortOrder]);

  useEffect(() => {
    loadFilters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t.dashboard.deleteConfirm)) return;

    try {
      await portfolioService.delete(id);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleFilterChange = (key: keyof PaginationParams, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      <div className="max-w-7xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                {t.dashboard.filters} {showFilters ? '▼' : '▶'}
              </button>
              <span className="text-zinc-600">
                {t.dashboard.totalProjects}: {pagination.total}
              </span>
            </div>
            <Button onClick={() => navigate('/admin/projects/create')}>
              {t.dashboard.addProject}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-zinc-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{t.dashboard.search}</label>
                <input
                  type="text"
                  placeholder={t.dashboard.searchPlaceholder}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{t.dashboard.location}</label>
                <select
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                >
                  <option value="">{t.dashboard.allLocations}</option>
                  {filterOptions.locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{t.dashboard.year}</label>
                <select
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                >
                  <option value="">{t.dashboard.allYears}</option>
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{t.dashboard.tags}</label>
                <select
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={(filters.tags && filters.tags[0]) || ''}
                  onChange={(e) => handleFilterChange('tags', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">{t.dashboard.allTags}</option>
                  {filterOptions.tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">{t.dashboard.image}</th>
                  <th
                    className="text-left py-3 px-4 font-medium text-zinc-700 cursor-pointer hover:text-zinc-900"
                    onClick={() => handleSort('title')}
                  >
                    {t.dashboard.titleLabel} {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">{t.dashboard.location}</th>
                  <th
                    className="text-left py-3 px-4 font-medium text-zinc-700 cursor-pointer hover:text-zinc-900"
                    onClick={() => handleSort('year')}
                  >
                    {t.dashboard.year} {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">{t.dashboard.tags}</th>
                  <th
                    className="text-left py-3 px-4 font-medium text-zinc-700 cursor-pointer hover:text-zinc-900"
                    onClick={() => handleSort('created_at')}
                  >
                    {t.dashboard.created} {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">{t.dashboard.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-zinc-600">{t.dashboard.loading}</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-zinc-600">{t.dashboard.noProjects}</td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900">{project.title}</td>
                      <td className="py-3 px-4 text-zinc-600">{project.location || '-'}</td>
                      <td className="py-3 px-4 text-zinc-600">{project.year || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            {t.dashboard.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            {t.dashboard.delete}
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
                {t.dashboard.showing} {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t.dashboard.of} {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t.dashboard.previous}
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const page = Math.max(1, pagination.page - 2) + i;
                  if (page > pagination.totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination({ ...pagination, page })}
                      className={`px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors ${
                        page === pagination.page ? 'bg-zinc-900 text-white' : ''
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t.dashboard.next}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
