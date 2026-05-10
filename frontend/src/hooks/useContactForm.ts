import { useState, useCallback } from 'react';
import { contactService } from '../services/api';
import type { ContactFormData } from '@buro710/shared';

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const result = await contactService.submit(formData);
        if (result.success) {
          setSuccess(true);
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          setError(result.message || 'Помилка при відправці');
        }
      } catch {
        setError('Помилка при відправці повідомлення. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
    setFormData({ name: '', email: '', subject: '', message: '' });
  }, []);

  return {
    formData,
    loading,
    success,
    error,
    handleChange,
    handleSubmit,
    reset,
  };
}
