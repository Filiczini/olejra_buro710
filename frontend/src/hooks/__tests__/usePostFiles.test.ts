import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostFiles } from '../usePostFiles';

function file(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

describe('usePostFiles', () => {
  it('adds a new entry keyed by the block id when no field is given', () => {
    const { result } = renderHook(() => usePostFiles());
    const f = file('a.jpg');

    act(() => {
      result.current.handleBlockImageChange('block-1', f);
    });

    expect(result.current.blockFiles).toEqual([{ id: 'block-1', file: f }]);
  });

  it('keys three_images slots as blockId__field', () => {
    const { result } = renderHook(() => usePostFiles());
    const f = file('slot0.jpg');

    act(() => {
      result.current.handleBlockImageChange('block-1', f, 'images.0');
    });

    expect(result.current.blockFiles).toEqual([{ id: 'block-1__images.0', file: f }]);
  });

  it('updates the file of an existing entry instead of duplicating it', () => {
    const { result } = renderHook(() => usePostFiles());
    const first = file('first.jpg');
    const second = file('second.jpg');

    act(() => {
      result.current.handleBlockImageChange('block-1', first);
    });
    act(() => {
      result.current.handleBlockImageChange('block-1', second);
    });

    expect(result.current.blockFiles).toEqual([{ id: 'block-1', file: second }]);
  });

  it('tracks multiple block/slot keys independently', () => {
    const { result } = renderHook(() => usePostFiles());
    const slot0 = file('slot0.jpg');
    const slot1 = file('slot1.jpg');

    act(() => {
      result.current.handleBlockImageChange('block-1', slot0, 'images.0');
    });
    act(() => {
      result.current.handleBlockImageChange('block-1', slot1, 'images.1');
    });

    expect(result.current.blockFiles).toEqual([
      { id: 'block-1__images.0', file: slot0 },
      { id: 'block-1__images.1', file: slot1 },
    ]);
  });

  it('allows clearing a file back to null without removing the entry', () => {
    const { result } = renderHook(() => usePostFiles());

    act(() => {
      result.current.handleBlockImageChange('block-1', file('a.jpg'));
    });
    act(() => {
      result.current.handleBlockImageChange('block-1', null);
    });

    expect(result.current.blockFiles).toEqual([{ id: 'block-1', file: null }]);
  });
});
