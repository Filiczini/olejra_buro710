import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddBlockMenu from '../AddBlockMenu';

vi.mock('@iconify-icon/react', () => ({
  Icon: ({ icon, ...props }: Record<string, unknown>) => (
    <span data-testid={`icon-${icon}`} {...props} />
  ),
}));

describe('AddBlockMenu', () => {
  it('renders "Додати блок" button', () => {
    render(<AddBlockMenu onAddBlock={vi.fn()} />);
    expect(screen.getByText('Додати блок')).toBeInTheDocument();
  });

  it('shows dropdown menu on click', () => {
    render(<AddBlockMenu onAddBlock={vi.fn()} />);
    fireEvent.click(screen.getByText('Додати блок'));
    expect(screen.getByText('Текст на повну ширину')).toBeInTheDocument();
    expect(screen.getByText('Зображення на повну ширину')).toBeInTheDocument();
  });

  it('hides dropdown on selection', () => {
    const onAddBlock = vi.fn();
    render(<AddBlockMenu onAddBlock={onAddBlock} />);
    fireEvent.click(screen.getByText('Додати блок'));
    fireEvent.click(screen.getByText('Текст на повну ширину'));
    expect(screen.queryByText('Зображення на повну ширину')).not.toBeInTheDocument();
  });

  it('calls onAddBlock with correct type', () => {
    const onAddBlock = vi.fn();
    render(<AddBlockMenu onAddBlock={onAddBlock} />);
    fireEvent.click(screen.getByText('Додати блок'));
    fireEvent.click(screen.getByText('Зображення на повну ширину'));
    expect(onAddBlock).toHaveBeenCalledWith('image_full');
  });

  it('shows all 5 block type options', () => {
    render(<AddBlockMenu onAddBlock={vi.fn()} />);
    fireEvent.click(screen.getByText('Додати блок'));
    expect(screen.getByText('Текст на повну ширину')).toBeInTheDocument();
    expect(screen.getByText('Зображення на повну ширину')).toBeInTheDocument();
    expect(screen.getByText('Текст + Зображення')).toBeInTheDocument();
    expect(screen.getByText('Зображення + Текст')).toBeInTheDocument();
    expect(screen.getByText('Три зображення')).toBeInTheDocument();
  });
});
