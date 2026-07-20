import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { mockUseBlocker } = vi.hoisted(() => ({ mockUseBlocker: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useBlocker: mockUseBlocker,
}));

import PostEditorShell from '../PostEditorShell';

function baseProps(overrides: Partial<React.ComponentProps<typeof PostEditorShell>> = {}) {
  return {
    isEditing: false,
    loading: false,
    saving: false,
    errors: {},
    toast: null,
    draftBanner: null,
    isDirty: false,
    getIsDirty: () => false,
    restoreDraft: vi.fn(),
    dismissDraft: vi.fn(),
    dismissToast: vi.fn(),
    handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onCancel: vi.fn(),
    children: <div>Form fields</div>,
    ...overrides,
  };
}

beforeEach(() => {
  mockUseBlocker.mockReturnValue({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() });
});

describe('PostEditorShell', () => {
  it('shows a loading spinner instead of the form while loading', () => {
    render(<PostEditorShell {...baseProps({ loading: true })} />);

    expect(screen.queryByText('Form fields')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Зберегти' })).not.toBeInTheDocument();
  });

  it('titles the page for creating vs editing', () => {
    const { rerender } = render(<PostEditorShell {...baseProps({ isEditing: false })} />);
    expect(screen.getByText('Нова сторінка')).toBeInTheDocument();

    rerender(<PostEditorShell {...baseProps({ isEditing: true })} />);
    expect(screen.getByText('Редагувати сторінку')).toBeInTheDocument();
  });

  it('shows the draft banner and wires Restore/Ignore', () => {
    const restoreDraft = vi.fn();
    const dismissDraft = vi.fn();
    render(
      <PostEditorShell
        {...baseProps({
          draftBanner: { savedAt: '2026-07-18T10:00:00.000Z' },
          restoreDraft,
          dismissDraft,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Відновити' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ігнорувати' }));

    expect(restoreDraft).toHaveBeenCalledTimes(1);
    expect(dismissDraft).toHaveBeenCalledTimes(1);
  });

  it('shows the submit error banner', () => {
    render(<PostEditorShell {...baseProps({ errors: { submit: 'Помилка збереження посту' } })} />);

    expect(screen.getAllByText('Помилка збереження посту').length).toBeGreaterThan(0);
  });

  it('shows a generic validation banner when there are field errors other than submit', () => {
    render(<PostEditorShell {...baseProps({ errors: { title: 'Обов’язкове поле' } })} />);

    expect(screen.getByText('Виправте помилки у формі перед збереженням')).toBeInTheDocument();
  });

  it('shows no error banners when there are no errors', () => {
    render(<PostEditorShell {...baseProps({ errors: {} })} />);

    expect(screen.queryByText(/помилк/i)).not.toBeInTheDocument();
  });

  it('disables the submit button and shows a saving label while saving', () => {
    render(<PostEditorShell {...baseProps({ saving: true })} />);

    expect(screen.getByRole('button', { name: /збереження/i })).toBeDisabled();
  });

  it('calls handleSubmit on submit and onCancel on cancel', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const onCancel = vi.fn();
    render(<PostEditorShell {...baseProps({ handleSubmit, onCancel })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the unsaved-changes modal when navigation is blocked, and wires Stay/Leave', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    mockUseBlocker.mockReturnValue({ state: 'blocked', proceed, reset });
    render(<PostEditorShell {...baseProps()} />);

    expect(screen.getByText('Незбережені зміни')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Залишитися' }));
    expect(reset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Вийти без збереження' }));
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('does not show the unsaved-changes modal when navigation is not blocked', () => {
    render(<PostEditorShell {...baseProps()} />);

    expect(screen.queryByText('Незбережені зміни')).not.toBeInTheDocument();
  });
});
