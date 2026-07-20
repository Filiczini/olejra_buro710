import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostFormState } from '../usePostFormState';

describe('usePostFormState', () => {
  it('starts with slug unlocked for a new post and locked when editing', () => {
    const { result: fresh } = renderHook(() => usePostFormState(false));
    expect(fresh.current.slugLocked).toBe(false);

    const { result: editing } = renderHook(() => usePostFormState(true));
    expect(editing.current.slugLocked).toBe(true);
  });

  it('updateTitle regenerates the slug while unlocked', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateTitle('Мій новий пост');
    });

    expect(result.current.title).toBe('Мій новий пост');
    expect(result.current.slug).toBe('miy-novyy-post');
  });

  it('updateTitle leaves the slug alone once it is locked', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateSlug('custom-slug');
    });
    act(() => {
      result.current.updateTitle('Another title');
    });

    expect(result.current.slug).toBe('custom-slug');
  });

  it('updateSlug locks the slug so future title edits stop overwriting it', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateSlug('manual-slug');
    });

    expect(result.current.slugLocked).toBe(true);
    expect(result.current.slug).toBe('manual-slug');
  });

  it('unlockSlug regenerates the slug from the current title and unlocks it', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateTitle('Перший заголовок');
    });
    act(() => {
      result.current.updateSlug('locked-manually');
    });
    expect(result.current.slugLocked).toBe(true);

    act(() => {
      result.current.unlockSlug();
    });

    expect(result.current.slugLocked).toBe(false);
    expect(result.current.slug).toBe('pershyy-zaholovok');
  });

  it('lockSlug locks without changing the slug value', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateTitle('Title');
    });
    act(() => {
      result.current.lockSlug();
    });

    expect(result.current.slugLocked).toBe(true);
    expect(result.current.slug).toBe('title');
  });

  it('applyFields only overwrites the fields explicitly provided', () => {
    const { result } = renderHook(() => usePostFormState(false));

    act(() => {
      result.current.updateTitle('Original title');
    });
    act(() => {
      result.current.applyFields({ status: 'published', featured: true });
    });

    expect(result.current.status).toBe('published');
    expect(result.current.featured).toBe(true);
    expect(result.current.title).toBe('Original title');
  });
});
