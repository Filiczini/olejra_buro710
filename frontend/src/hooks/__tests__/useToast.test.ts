import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useToast', () => {
  it('starts with no toast', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeNull();
  });

  it('showToast sets the message and type', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved', 'success');
    });

    expect(result.current.toast).toMatchObject({ message: 'Saved', type: 'success' });
  });

  it('gives each toast a distinct key so repeated identical messages still re-trigger', () => {
    const dateSpy = vi.spyOn(Date, 'now');
    dateSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Error', 'error');
    });
    const firstKey = result.current.toast?.key;

    act(() => {
      result.current.showToast('Error', 'error');
    });

    expect(result.current.toast?.key).not.toBe(firstKey);
  });

  it('dismissToast clears the current toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved', 'success');
    });
    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toast).toBeNull();
  });
});
