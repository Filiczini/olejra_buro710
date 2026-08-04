import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  contactService: { submit: vi.fn() },
}));

import { useContactForm } from '../useContactForm';
import { contactService } from '../../services/api';

function changeEvent(name: string, value: string) {
  return {
    preventDefault: vi.fn(),
    target: { name, value },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useContactForm', () => {
  it('starts with an empty form and no success/error state', () => {
    const { result } = renderHook(() => useContactForm());

    expect(result.current.formData).toEqual({ name: '', email: '', phone: '', message: '' });
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handleChange updates the matching field only', () => {
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange(changeEvent('name', 'Diana'));
    });

    expect(result.current.formData.name).toBe('Diana');
    expect(result.current.formData.email).toBe('');
  });

  it('handleSubmit marks success and clears the form on a successful submit', async () => {
    vi.mocked(contactService.submit).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange(changeEvent('name', 'Diana'));
    });
    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.success).toBe(true);
    expect(result.current.formData).toEqual({ name: '', email: '', phone: '', message: '' });
    expect(result.current.error).toBeNull();
  });

  it('handleSubmit surfaces the backend message when the API reports failure without throwing', async () => {
    vi.mocked(contactService.submit).mockResolvedValue({
      success: false,
      message: 'Rate limited',
    });
    const { result } = renderHook(() => useContactForm());

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Rate limited');
  });

  it('handleSubmit sets a generic error message when the request throws', async () => {
    vi.mocked(contactService.submit).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useContactForm());

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Помилка при відправці повідомлення. Спробуйте пізніше.');
  });

  it('reset() clears success/error state and the form data', async () => {
    vi.mocked(contactService.submit).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange(changeEvent('name', 'Diana'));
    });
    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.formData).toEqual({ name: '', email: '', phone: '', message: '' });
  });
});
