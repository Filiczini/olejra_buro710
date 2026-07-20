import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} limit={10} onPageChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current item range out of the total', () => {
    render(<Pagination page={2} totalPages={3} total={25} limit={10} onPageChange={vi.fn()} />);

    expect(screen.getByText('Показано 11-20 з 25')).toBeInTheDocument();
  });

  it('clamps the last-page range to the total item count', () => {
    render(<Pagination page={3} totalPages={3} total={25} limit={10} onPageChange={vi.fn()} />);

    expect(screen.getByText('Показано 21-25 з 25')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination page={1} totalPages={3} total={25} limit={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Попередня сторінка' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Наступна сторінка' })).not.toBeDisabled();
  });

  it('calls onPageChange with the target page number', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={5} total={50} limit={10} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Наступна сторінка' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'Попередня сторінка' }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Сторінка 5' }));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('shows at most 5 page number buttons centered on the current page', () => {
    render(<Pagination page={5} totalPages={10} total={100} limit={10} onPageChange={vi.fn()} />);

    for (const p of [3, 4, 5, 6, 7]) {
      expect(screen.getByRole('button', { name: `Сторінка ${p}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: 'Сторінка 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сторінка 8' })).not.toBeInTheDocument();
  });

  it('highlights the current page button', () => {
    render(<Pagination page={2} totalPages={5} total={50} limit={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Сторінка 2' }).className).toContain('bg-gray-900');
  });
});
