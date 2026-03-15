import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TextFullBlock from '../TextFullBlock';
import type { TextFullData } from '../../../types/block';

describe('TextFullBlock', () => {
  it('renders content in quotes', () => {
    const data: TextFullData = { content: 'Hello world' };
    render(<TextFullBlock data={data} />);
    expect(screen.getByText(/^"Hello world"$/)).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    const data: TextFullData = { content: 'Some text', label: 'My Label' };
    render(<TextFullBlock data={data} />);
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('does not render when content is empty', () => {
    const data: TextFullData = { content: '' };
    const { container } = render(<TextFullBlock data={data} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders stats (area, months, year) when provided', () => {
    const data: TextFullData = {
      content: 'Stats test',
      area: '120',
      months: '6',
      year: '2024',
    };
    render(<TextFullBlock data={data} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('m²')).toBeInTheDocument();
    expect(screen.getByText('Area')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Months')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('does not render stats section when no stats', () => {
    const data: TextFullData = { content: 'No stats' };
    render(<TextFullBlock data={data} />);
    expect(screen.queryByText('Area')).not.toBeInTheDocument();
    expect(screen.queryByText('Months')).not.toBeInTheDocument();
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
  });
});
