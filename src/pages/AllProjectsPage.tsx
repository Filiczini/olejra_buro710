import { useEffect, useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import type { Project } from '../types/project';
import { portfolioService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../config/translations';

export default function AllProjectsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Extract unique locations and years
  const [locations, setLocations] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters: any = { page, limit: 12 };
      if (searchQuery) filters.search = searchQuery;
      if (selectedLocation) filters.location = selectedLocation;
      if (selectedYear) filters.year = selectedYear;

      const result = await portfolioService.getAll(filters);
      setProjects(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);

      // Extract unique locations and years for filters
      if (result.data.length > 0 && (locations.length === 0 || years.length === 0)) {
        const uniqueLocations = [...new Set(result.data.map(p => p.location).filter((loc): loc is string => Boolean(loc)))].sort();
        const uniqueYears = [...new Set(result.data.map(p => p.year).filter((year): year is string => Boolean(year)))]
          .sort((a, b) => b.localeCompare(a));
        setLocations(uniqueLocations);
        setYears(uniqueYears);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, searchQuery, selectedLocation, selectedYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProjects();
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedYear('');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-20">
        <div className="max-w-[1800px] mx-auto px-6 py-24">
          <div className="text-center text-zinc-600">{t.project.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="max-w-[1800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            {t.navigation.projects}
          </h1>
          <p className="text-zinc-600 text-lg">
            {total} {language === 'uk' ? 'проєктів' : 'projects'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              className="w-full max-w-md px-5 py-3 bg-white border border-zinc-200 rounded-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <Icon icon="solar:magnifer-linear" width={20} />
            </button>
          </form>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="px-5 py-3 bg-white border border-zinc-200 rounded-full text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent cursor-pointer"
            >
              <option value="">{t.dashboard.allLocations}</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-5 py-3 bg-white border border-zinc-200 rounded-full text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent cursor-pointer"
            >
              <option value="">{t.dashboard.allYears}</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            {(searchQuery || selectedLocation || selectedYear) && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t.allProjects.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            {t.dashboard.noProjects}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16 mb-16">
              {projects.map((project, index) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={`group block space-y-4 ${index === 1 ? 'md:mt-24' : ''}`}
                >
                  <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
                    <div>
                      <h4 className="text-lg font-medium text-zinc-900">{project.title}</h4>
                      <p className="text-sm text-zinc-500 mt-1">
                        {project.location} {project.year && `· ${project.year}`}
                      </p>
                    </div>
                    <Icon icon="solar:arrow-right-linear" width={20} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-900 transition-colors"
                >
                  {t.allProjects.previous}
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-6 py-3 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white transition-colors ${
                        pageNum === page ? 'bg-zinc-900 text-white' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-900 transition-colors"
                >
                  {t.allProjects.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
