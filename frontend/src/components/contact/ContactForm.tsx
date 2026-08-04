import { Icon } from '@iconify-icon/react';
import type { ContactFormData } from '@buro710/shared';

interface ContactFormProps {
  formData: ContactFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

interface FieldProps {
  label: string;
  name: keyof ContactFormData;
  value: string;
  placeholder: string;
  type?: string;
  disabled: boolean;
  onChange: ContactFormProps['onChange'];
}

function ContactField({
  label,
  name,
  value,
  placeholder,
  type = 'text',
  disabled,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-600">
        {label} <span className="text-red-500">*</span>
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        disabled={disabled}
        className="h-14 w-full rounded-lg border border-zinc-600 bg-transparent px-4 text-base outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
      />
    </label>
  );
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
      <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
        <Icon icon="solar:check-circle-linear" width={56} className="mb-5 text-green-600" />
        <h2 className="mb-2 font-display text-3xl">Повідомлення надіслано!</h2>
        <p className="mb-7 text-zinc-500">Ми зв'яжемося з вами найближчим часом.</p>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-zinc-500 px-7 py-3 hover:bg-zinc-900 hover:text-white"
        >
          Надіслати ще одне
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <ContactField
        label="Ім'я"
        name="name"
        value={formData.name}
        placeholder="Ваше ім'я"
        disabled={loading}
        onChange={onChange}
      />
      <ContactField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        placeholder="Введіть ваш email"
        disabled={loading}
        onChange={onChange}
      />
      <ContactField
        label="Номер телефону"
        name="phone"
        type="tel"
        value={formData.phone}
        placeholder="Ваш номер +380 __ ___ __ __"
        disabled={loading}
        onChange={onChange}
      />

      <label className="block">
        <span className="mb-2 block text-sm text-zinc-600">
          Повідомлення <span className="text-red-500">*</span>
        </span>
        <textarea
          name="message"
          value={formData.message}
          onChange={onChange}
          placeholder="Ваше повідомлення..."
          rows={7}
          required
          disabled={loading}
          className="w-full resize-none rounded-lg border border-zinc-600 bg-transparent px-4 py-4 text-base outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>

      <div className="flex justify-center pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 min-w-[260px] items-center justify-center rounded-xl bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Icon icon="solar:spinner-linear" width={18} className="animate-spin" />
              Відправка...
            </span>
          ) : (
            'Надіслати повідомлення'
          )}
        </button>
      </div>
    </form>
  );
}
