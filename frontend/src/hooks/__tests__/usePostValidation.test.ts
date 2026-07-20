import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostValidation, type ValidationValues } from '../usePostValidation';

function values(overrides: Partial<ValidationValues> = {}): ValidationValues {
  return {
    title: 'Valid title',
    slug: 'valid-slug',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    heroData: {},
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePostValidation', () => {
  it('validate() accepts a fully valid post and clears errors', () => {
    const { result } = renderHook(() => usePostValidation());

    let isValid = false;
    act(() => {
      isValid = result.current.validate(values());
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('validate() rejects a missing title and reports the field error', () => {
    const { result } = renderHook(() => usePostValidation());

    let isValid = true;
    act(() => {
      isValid = result.current.validate(values({ title: '' }));
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.title).toBeTruthy();
  });

  it('validate() reports one error per invalid field, keeping the first issue for each', () => {
    const { result } = renderHook(() => usePostValidation());

    act(() => {
      result.current.validate(values({ title: '', slug: 'Not A Valid Slug!' }));
    });

    expect(Object.keys(result.current.errors)).toEqual(expect.arrayContaining(['title', 'slug']));
  });

  it('validateField sets an error for an invalid single field', () => {
    const { result } = renderHook(() => usePostValidation());

    act(() => {
      result.current.validateField('title', '');
    });

    expect(result.current.errors.title).toBeTruthy();
  });

  it('validateField clears a previously set error once the value becomes valid', () => {
    const { result } = renderHook(() => usePostValidation());

    act(() => {
      result.current.validateField('title', '');
    });
    expect(result.current.errors.title).toBeTruthy();

    act(() => {
      result.current.validateField('title', 'Now valid');
    });

    expect(result.current.errors.title).toBeUndefined();
  });

  it('validateField is a no-op for a field the schema does not know about', () => {
    const { result } = renderHook(() => usePostValidation());

    act(() => {
      result.current.validateField('not_a_real_field', 'anything');
    });

    expect(result.current.errors).toEqual({});
  });

  it('clearFieldError removes only the targeted field', () => {
    const { result } = renderHook(() => usePostValidation());

    act(() => {
      result.current.setErrors({ title: 'bad title', slug: 'bad slug' });
    });
    act(() => {
      result.current.clearFieldError('title');
    });

    expect(result.current.errors).toEqual({ slug: 'bad slug' });
  });
});
