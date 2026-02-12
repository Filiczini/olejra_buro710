import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/admin/ProjectForm';
import { portfolioService } from '../../services/api';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      await portfolioService.create(formDataToSend);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-zinc-600 hover:text-zinc-900"
        >
          ← Повернутися до панелі керування
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">Створити проєкт</h1>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <ProjectForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Створити"
            submitLoadingLabel="Створення..."
          >
            <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <p className="text-zinc-600">Форма в розробці...</p>
            </section>
          </ProjectForm>
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
