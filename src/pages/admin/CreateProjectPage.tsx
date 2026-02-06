import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/admin/ImageUpload';
import TagInput from '../../components/admin/TagInput';
import type { CreateProjectData } from '../../types/project';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    image: null as unknown as File,
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.image || formData.image.size === 0) {
      newErrors.image = 'Image is required';
    }

    if (formData.tags.length > 10) {
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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', formData.image);
      formDataToSend.append('tags', JSON.stringify(formData.tags));

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      navigate('/admin/dashboard');
    } catch (error) {
      const err = error as Error;
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-zinc-900">Create Project</h1>
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
              tags={formData.tags}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
            />
            {errors.tags && <span className="text-sm text-red-500">{errors.tags}</span>}

            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
