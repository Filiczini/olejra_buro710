import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../imageFileValidation';

function file(type: string, size: number): File {
  return new File([new Uint8Array(size)], 'photo', { type });
}

describe('validateImageFile', () => {
  it('accepts a valid JPEG under the size limit', () => {
    expect(validateImageFile(file('image/jpeg', 1024))).toBeNull();
  });

  it('accepts a valid PNG under the size limit', () => {
    expect(validateImageFile(file('image/png', 1024))).toBeNull();
  });

  it.each(['image/gif', 'image/webp', 'application/pdf', ''])(
    'rejects a disallowed mime type (%s) with "type"',
    (type) => {
      expect(validateImageFile(file(type, 1024))).toBe('type');
    }
  );

  it('rejects a file over the size limit with "size"', () => {
    expect(validateImageFile(file('image/jpeg', MAX_IMAGE_SIZE_BYTES + 1))).toBe('size');
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateImageFile(file('image/jpeg', MAX_IMAGE_SIZE_BYTES))).toBeNull();
  });

  it('checks type before size', () => {
    expect(validateImageFile(file('image/gif', MAX_IMAGE_SIZE_BYTES + 1))).toBe('type');
  });

  it('exposes the allowed types and size limit as constants', () => {
    expect(ALLOWED_IMAGE_TYPES).toEqual(['image/jpeg', 'image/png', 'image/jpg']);
    expect(MAX_IMAGE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});
