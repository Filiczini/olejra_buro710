import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/admin/ImageUpload';
import TagInput from '../../components/admin/TagInput';
import type { UpdateProjectData, Project } from '../../types/project';
import { portfolioService } from '../../services/api';

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<UpdateProjectData>({
    title: '',
    description: '',
    image: undefined,
    tags: [],
    location: '',
    area: '',
    year: '',
    team: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        const data = await portfolioService.getById(id);
        setProject(data);
        setFormData({
          title: data.title,
          description: data.description[0] || '',
          tags: data.tags,
          location: data.location || '',
          area: data.area || '',
          year: data.year || '',
          team: data.team || '',
        });
      } catch (error) {
        console.error('Error loading project:', error);
        navigate('/admin/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title && formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.tags && formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      if (formData.title) {
        formDataToSend.append('title', formData.title);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.tags) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }
      if (formData.area) {
        formDataToSend.append('area', formData.area);
      }
      if (formData.year) {
        formDataToSend.append('year', formData.year);
      }
      if (formData.team) {
        formDataToSend.append('team', formData.team);
      }

      await portfolioService.update(id!, formDataToSend);

      navigate('/admin/dashboard');
    } catch (error) {
      const err = error as Error;
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-zinc-600 hover:text-zinc-900"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col gap-6">
            <Input
              label="Title"
              placeholder="Enter project title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Description</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[120px]"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
            </div>

            <ImageUpload
              onFileSelect={(file) => setFormData({ ...formData, image: file as unknown as File })}
              error={errors.image}
            />

            <TagInput
              tags={formData.tags || []}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
            />
            {errors.tags && <span className="text-sm text-red-500">{errors.tags}</span>}

            <Input
              label="Location"
              placeholder="Enter location"
              value={formData.location || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
            />

            <Input
              label="Area"
              placeholder="Enter area (e.g., 150 m²)"
              value={formData.area || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
            />

            <Input
              label="Year"
              placeholder="Enter year (e.g., 2024)"
              value={formData.year || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
            />

            <Input
              label="Team"
              placeholder="Enter team members"
              value={formData.team || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, team: e.target.value })}
            />

            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 py-3">
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1 py-3"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
