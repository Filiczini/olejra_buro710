import { supabase } from '../config/supabase';
import { storageService } from './storageService';
import type { Media, Project } from '../../types/project';

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
    const [projectResult, mediaResult] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('media')
        .select('*')
        .eq('project_id', id)
        .order('sort_order', { ascending: true }),
    ]);

    if (projectResult.error) throw projectResult.error;
    if (mediaResult.error) throw mediaResult.error;

    const media = mediaResult.data || [];
    const heroMedia = media.filter(m => m.role === 'hero');
    const galleryMedia = media.filter(m => m.role === 'gallery');

    return {
      project: projectResult.data as Project,
      heroMedia: heroMedia as Media[],
      galleryMedia: galleryMedia as Media[],
    };
  },

  create: async (data: any) => {
    const { heroMedia, galleryMedia, ...projectData } = data;

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Failed to create project');

    if (heroMedia && heroMedia.length > 0) {
      await createMediaForProject(project.id, heroMedia, 'hero');
    }

    if (galleryMedia && galleryMedia.length > 0) {
      await createMediaForProject(project.id, galleryMedia, 'gallery');
    }

    return project;
  },

  update: async (id: string, data: any) => {
    const { heroMediaIdsOrdered, galleryMediaIdsOrdered, ...projectData } = data;

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Failed to update project');

    if (heroMediaIdsOrdered) {
      await reorderMedia(heroMediaIdsOrdered);
    }

    if (galleryMediaIdsOrdered) {
      await reorderMedia(galleryMediaIdsOrdered);
    }

    return project;
  },

  delete: async (id: string) => {
    await supabase
      .from('projects')
      .delete()
      .eq('id', id);
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

/**
 * Create media records for a project by uploading images
 * @param projectId - UUID of the project
 * @param files - Array of file objects to upload
 * @param role - Role of the media ('hero' or 'gallery')
 */
async function createMediaForProject(
  projectId: string,
  files: Express.Multer.File[],
  role: 'hero' | 'gallery'
): Promise<void> {
  const uploadResult = await storageService.uploadImages(files);

  if (uploadResult.errors.length > 0) {
    console.warn(`Some uploads failed: ${uploadResult.errors.join(', ')}`);
  }

  if (uploadResult.urls.length === 0) {
    throw new Error('No files were uploaded successfully');
  }

  const mediaRecords = uploadResult.urls.map((url, index) => ({
    project_id: projectId,
    url,
    role,
    sort_order: index,
  }));

  const { error } = await supabase
    .from('media')
    .insert(mediaRecords);

  if (error) throw error;
}

/**
 * Reorder media records by updating sort_order based on the ordered IDs
 * @param mediaIdsOrdered - Array of media IDs in the desired order
 */
async function reorderMedia(mediaIdsOrdered: string[]): Promise<void> {
  const updatePromises = mediaIdsOrdered.map((id, index) =>
    supabase
      .from('media')
      .update({ sort_order: index })
      .eq('id', id)
  );

  const results = await Promise.all(updatePromises);

  const errors = results.filter(r => r.error).map(r => r.error);
  if (errors.length > 0) {
    throw new Error(`Failed to reorder media: ${errors.map(e => e?.message).join(', ')}`);
  }
}
