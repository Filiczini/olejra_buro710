import Button from '../ui/Button';

interface ProjectFormProps {
  children?: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  submitLoadingLabel?: string;
}

export default function ProjectForm({
  children,
  onSubmit,
  loading,
  submitLabel = 'Зберегти',
  submitLoadingLabel = 'Збереження...',
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {children}

      <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? submitLoadingLabel : submitLabel}
        </Button>
      </section>
    </form>
  );
}
