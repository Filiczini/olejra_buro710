import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompressionStatus from '../CompressionStatus';

describe('CompressionStatus', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<CompressionStatus message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the message while compression is in progress', () => {
    render(<CompressionStatus message="Стискаємо 2.4 МБ..." />);

    expect(screen.getByText('Стискаємо 2.4 МБ...')).toBeInTheDocument();
  });

  it('shows the message once compression has finished', () => {
    render(<CompressionStatus message="2.4 МБ → 0.8 МБ" />);

    expect(screen.getByText('2.4 МБ → 0.8 МБ')).toBeInTheDocument();
  });

  it('applies an extra className when provided', () => {
    const { container } = render(<CompressionStatus message="x" className="mb-2" />);

    expect(container.firstChild).toHaveClass('mb-2');
  });
});
