import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';
import type { ContactFormData } from '@buro710/shared';

function baseProps(overrides: Partial<React.ComponentProps<typeof ContactForm>> = {}) {
  const formData: ContactFormData = { name: '', email: '', phone: '', message: '' };
  return {
    formData,
    loading: false,
    error: null,
    success: false,
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

describe('ContactForm', () => {
  it('shows a success screen instead of the form once success is true', () => {
    render(<ContactForm {...baseProps({ success: true })} />);

    expect(screen.getByText('Повідомлення надіслано!')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Ваше ім'я")).not.toBeInTheDocument();
  });

  it('calls onReset from the success screen', () => {
    const onReset = vi.fn();
    render(<ContactForm {...baseProps({ success: true, onReset })} />);

    fireEvent.click(screen.getByRole('button', { name: /надіслати ще одне/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows the error banner when error is set', () => {
    render(<ContactForm {...baseProps({ error: 'Rate limited' })} />);

    expect(screen.getByText('Rate limited')).toBeInTheDocument();
  });

  it('calls onChange when a field is edited', () => {
    const onChange = vi.fn();
    render(<ContactForm {...baseProps({ onChange })} />);

    fireEvent.change(screen.getByPlaceholderText("Ваше ім'я"), { target: { value: 'Diana' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSubmit when the form is submitted', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<ContactForm {...baseProps({ onSubmit })} />);

    fireEvent.submit(
      screen.getByRole('button', { name: /надіслати повідомлення/i }).closest('form')!
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables inputs and shows a loading label on the submit button while loading', () => {
    render(<ContactForm {...baseProps({ loading: true })} />);

    expect(screen.getByPlaceholderText("Ваше ім'я")).toBeDisabled();
    expect(screen.getByText('Відправка...')).toBeInTheDocument();
  });
});
