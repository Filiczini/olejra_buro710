import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostDraft, type DraftData } from '../usePostDraft';

function snapshot(overrides: Partial<Omit<DraftData, 'savedAt'>> = {}): Omit<DraftData, 'savedAt'> {
  return {
    title: 'Draft title',
    slug: 'draft-title',
    slugLocked: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    featured: false,
    heroData: {
      hero_image_url: '',
      hero_title: '',
      hero_subtitle: '',
      hero_tags: [],
      hero_location: '',
      hero_year: '',
    },
    blocks: [],
    galleryImages: [],
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('usePostDraft', () => {
  it('has no banner when nothing was saved under the draft key', () => {
    const { result } = renderHook(() => usePostDraft('draft:new'));

    expect(result.current.banner).toBeNull();
    expect(result.current.dataRef.current).toBeNull();
  });

  it('shows a banner and exposes the stored draft when one already exists', () => {
    localStorage.setItem(
      'draft:new',
      JSON.stringify({ ...snapshot({ title: 'Restored' }), savedAt: '2026-07-18T10:00:00.000Z' })
    );

    const { result } = renderHook(() => usePostDraft('draft:new'));

    expect(result.current.banner).toEqual({ savedAt: '2026-07-18T10:00:00.000Z' });
    expect(result.current.dataRef.current?.title).toBe('Restored');
  });

  it('treats corrupted localStorage content as no draft', () => {
    localStorage.setItem('draft:new', '{not-json');

    const { result } = renderHook(() => usePostDraft('draft:new'));

    expect(result.current.banner).toBeNull();
  });

  it('save() persists the snapshot with a savedAt timestamp under the draft key', () => {
    const { result } = renderHook(() => usePostDraft('draft:new'));

    act(() => {
      result.current.save(snapshot({ title: 'Saved title' }));
    });

    const stored = JSON.parse(localStorage.getItem('draft:new') ?? 'null');
    expect(stored.title).toBe('Saved title');
    expect(typeof stored.savedAt).toBe('string');
  });

  it('dismiss() clears the stored draft, the banner, and the data ref', () => {
    localStorage.setItem(
      'draft:new',
      JSON.stringify({ ...snapshot(), savedAt: '2026-07-18T10:00:00.000Z' })
    );
    const { result } = renderHook(() => usePostDraft('draft:new'));

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.banner).toBeNull();
    expect(result.current.dataRef.current).toBeNull();
    expect(localStorage.getItem('draft:new')).toBeNull();
  });

  it('keys drafts independently per draftKey', () => {
    localStorage.setItem(
      'draft:post-1',
      JSON.stringify({
        ...snapshot({ title: 'Post 1 draft' }),
        savedAt: '2026-07-18T10:00:00.000Z',
      })
    );

    const { result } = renderHook(() => usePostDraft('draft:post-2'));

    expect(result.current.banner).toBeNull();
  });
});
