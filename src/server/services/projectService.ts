import { supabase } from '../config/supabase';

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FilterParams {
  tags?: string[];
  location?: string;
  year?: string;
  search?: string;
}

export const projectService = {
  getAll: async (params?: PaginationParams & FilterParams) => {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', tags, location, year, search } = params || {};
    
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' });

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (year) {
      query = query.eq('year', year);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (data: any) => {
    // Initialize with empty sections array if not provided
    const projectData = {
      ...data,
      sections: data.sections || []
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return project;
  },

  update: async (id: string, data: any) => {
    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return project;
  },

  delete: async (id: string) => {
    await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  },

  getNextProject: async (currentId: string) => {
    // Get current project to find its order
    const { data: current, error: currentError } = await supabase
      .from('projects')
      .select('created_at')
      .eq('id', currentId)
      .single();

    if (currentError || !current) {
      throw currentError || new Error('Current project not found');
    }

    // Get next project (created after current)
    const { data: next, error: nextError } = await supabase
      .from('projects')
      .select('id, title, image_url, slug')
      .gt('created_at', current.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    // If no next project, get the first one
    if (nextError || !next) {
      const { data: first, error: firstError } = await supabase
        .from('projects')
        .select('id, title, image_url, slug')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstError || !first) {
        return null; // No projects at all
      }

      return first;
    }

    return next;
  },

  getFiltersOptions: async () => {
    const [tagsResult, locationsResult, yearsResult] = await Promise.all([
      supabase.from('projects').select('tags'),
      supabase.from('projects').select('location'),
      supabase.from('projects').select('year'),
    ]);

    const allTags = tagsResult.data?.flatMap(p => p.tags || []) || [];
    const uniqueTags = [...new Set(allTags)].sort();

    const locations = locationsResult.data?.map(p => p.location).filter(Boolean) || [];
    const uniqueLocations = [...new Set(locations)].sort();

    const years = yearsResult.data?.map(p => p.year).filter(Boolean) || [];
    const uniqueYears = [...new Set(years)].sort((a, b) => b.localeCompare(a));

    return {
      tags: uniqueTags,
      locations: uniqueLocations,
      years: uniqueYears,
    };
  },
};
