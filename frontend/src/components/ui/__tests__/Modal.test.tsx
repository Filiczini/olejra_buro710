import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders its content and title when open', () => {
    render(
      <Modal isOpen title="My title" onClose={vi.fn()}>
        Body content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('My title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>Body content</p>
      </Modal>
    );

    fireEvent.click(screen.getByText('Body content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Title" onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: /закрити/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape and not when closed', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen title="T" onClose={onClose}>
        Body
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal isOpen={false} title="T" onClose={onClose}>
        Body
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('labels the dialog with its title and locks body scroll while open', () => {
    const { unmount } = render(
      <Modal isOpen title="My title" onClose={vi.fn()}>
        Body
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('My title');
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('closes only the topmost modal on Escape when modals are stacked', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Modal isOpen title="Outer" onClose={outer}>
          Outer body
        </Modal>
        <Modal isOpen title="Inner" onClose={inner}>
          Inner body
        </Modal>
      </>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});
