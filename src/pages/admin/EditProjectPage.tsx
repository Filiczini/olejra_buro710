import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ProjectForm from '../../components/admin/ProjectForm';
import { portfolioService } from '../../services/api';

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        await portfolioService.getById(id);
      } catch (error) {
        console.error('Error loading project:', error);
        navigate('/admin/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      await portfolioService.update(id, formDataToSend);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-zinc-600 hover:text-zinc-900"
        >
          ← Повернутися до панелі керування
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">Редагувати проєкт</h1>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <ProjectForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Зберегти"
            submitLoadingLabel="Збереження..."
          >
            <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <p className="text-zinc-600">Форма в розробці...</p>
            </section>
          </ProjectForm>

          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/dashboard')}
              className="w-full py-3"
            >
              Скасувати
            </Button>
          </div>
        </div>

        <div className="hidden lg:block lg:w-[400px]">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Прев'ю</h3>
            <p className="text-zinc-600 text-sm">Прев'ю буде доступне після заповнення форми</p>
          </div>
        </div>
      </div>
    </div>
  );
}
