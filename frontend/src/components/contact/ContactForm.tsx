import { Icon } from '@iconify-icon/react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { ContactFormData } from '../../hooks/useContactForm';

interface ContactFormProps {
  formData: ContactFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function ContactForm({
  formData,
  loading,
  error,
  success,
  onChange,
  onSubmit,
  onReset,
}: ContactFormProps) {
  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <Icon icon="solar:check-circle-linear" width={32} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-medium mb-2">Повідомлення надіслано!</h3>
        <p className="text-zinc-500 mb-6">Ми зв'яжемося з вами найближчим часом.</p>
        <Button variant="secondary" onClick={onReset}>
          Надіслати ще одне повідомлення
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Ім'я"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Ваше ім'я"
          required
          disabled={loading}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Введіть ваш email"
          required
          disabled={loading}
        />
      </div>
      <Input
        label="Тема"
        name="subject"
        value={formData.subject}
        onChange={onChange}
        placeholder="Тема вашого повідомлення"
        required
        disabled={loading}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-zinc-700">
          Повідомлення
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={onChange}
          placeholder="Ваше повідомлення..."
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none disabled:bg-zinc-100 disabled:cursor-not-allowed"
          required
          disabled={loading}
          minLength={10}
        />
      </div>
      <div className="text-center">
        <Button type="submit" variant="primary" className="px-12 py-4" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Icon icon="solar:spinner-linear" width={18} className="animate-spin" />
              Відправка...
            </span>
          ) : (
            'Надіслати повідомлення'
          )}
        </Button>
      </div>
    </form>
  );
}
