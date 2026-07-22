import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Toast from '../ui/Toast';

interface DraftBanner {
  savedAt: string;
}

interface ToastState {
  key: number;
  message: string;
  type: 'success' | 'error';
}

interface PostEditorShellProps {
  isEditing: boolean;
  loading: boolean;
  saving: boolean;
  errors: Record<string, string>;
  toast: ToastState | null;
  draftBanner: DraftBanner | null;
  isDirty: boolean;
  getIsDirty: () => boolean;
  restoreDraft: () => void;
  dismissDraft: () => void;
  dismissToast: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export default function PostEditorShell({
  isEditing,
  loading,
  saving,
  errors,
  toast,
  draftBanner,
  isDirty,
  getIsDirty,
  restoreDraft,
  dismissDraft,
  dismissToast,
  handleSubmit,
  onCancel,
  children,
}: PostEditorShellProps) {
  const blocker = useBlocker(getIsDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const hasValidationErrors = Object.keys(errors).some((k) => k !== 'submit');

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {isEditing ? 'Редагувати сторінку' : 'Нова сторінка'}
        </h1>
      </div>

      {draftBanner && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Знайдено незбережену версію</span> від{' '}
            {new Date(draftBanner.savedAt).toLocaleTimeString('uk-UA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Відновити?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 text-sm font-medium bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Відновити
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              Ігнорувати
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.submit}
          </div>
        )}

        {children}

        {(errors.submit || hasValidationErrors) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit || 'Виправте помилки у формі перед збереженням'}
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Скасувати
          </Button>
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving && <Icon icon="solar:spinner-linear" width={16} className="animate-spin" />}
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </form>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <Modal
        isOpen={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Незбережені зміни"
      >
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
          Ви маєте незбережені зміни. Якщо вийдете зараз — вони будуть втрачені.
        </p>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => blocker.reset?.()}>
            Залишитися
          </Button>
          <Button type="button" onClick={() => blocker.proceed?.()}>
            Вийти без збереження
          </Button>
        </div>
      </Modal>
    </div>
  );
}
