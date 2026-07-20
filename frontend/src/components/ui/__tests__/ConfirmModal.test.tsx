import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete post"
        message="Are you sure?"
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses the default confirm/cancel labels', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete post"
        message="Are you sure?"
      />
    );

    expect(screen.getByRole('button', { name: 'Підтвердити' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скасувати' })).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Delete post"
        message="Are you sure?"
        confirmText="Delete"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Delete post"
        message="Are you sure?"
        cancelText="Never mind"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Never mind' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while isLoading is true', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete post"
        message="Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading
      />
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
