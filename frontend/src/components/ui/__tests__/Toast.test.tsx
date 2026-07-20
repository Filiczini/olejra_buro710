import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast from '../Toast';

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('renders the message', () => {
    render(<Toast message="Saved" type="success" onDismiss={vi.fn()} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('calls onDismiss automatically after its lifetime elapses', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Saved" type="success" onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(3400);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss before its lifetime elapses', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Saved" type="success" onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('clears its timers on unmount so onDismiss is never called late', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { unmount } = render(<Toast message="Saved" type="success" onDismiss={onDismiss} />);

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
