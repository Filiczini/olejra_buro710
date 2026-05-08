import { describe, it, expect } from 'vitest';
import { validateFileSignature } from '../multer';

describe('validateFileSignature', () => {
  it('returns true for valid JPEG signature', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(validateFileSignature(jpeg, 'image/jpeg')).toBe(true);
  });

  it('returns true for valid JPEG with APP1 marker', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe1]);
    expect(validateFileSignature(jpeg, 'image/jpeg')).toBe(true);
  });

  it('returns true for valid PNG signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    expect(validateFileSignature(png, 'image/png')).toBe(true);
  });

  it('returns false for truncated buffer', () => {
    const short = Buffer.from([0xff, 0xd8]);
    expect(validateFileSignature(short, 'image/jpeg')).toBe(false);
  });

  it('returns false for wrong signature', () => {
    const garbage = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileSignature(garbage, 'image/jpeg')).toBe(false);
  });

  it('returns false for unknown mimetype', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00]);
    expect(validateFileSignature(buf, 'image/gif')).toBe(false);
  });

  it('treats image/jpg same as image/jpeg', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff]);
    expect(validateFileSignature(jpeg, 'image/jpg')).toBe(true);
  });
});
