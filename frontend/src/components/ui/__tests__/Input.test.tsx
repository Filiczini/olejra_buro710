import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<Input />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<Input error="Поле обов'язкове" />);
    expect(screen.getByText("Поле обов'язкове")).toBeInTheDocument();
  });

  it('does not render error message when not provided', () => {
    render(<Input />);
    expect(screen.queryByText(/обов/i)).not.toBeInTheDocument();
  });

  it('applies error border styles when error is provided', () => {
    render(<Input error="Помилка" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('does not apply error border styles without error', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.className).not.toContain('border-red-500');
  });

  it('passes through native input props', () => {
    render(<Input placeholder="Введіть текст" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Введіть текст');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-class');
  });
});
