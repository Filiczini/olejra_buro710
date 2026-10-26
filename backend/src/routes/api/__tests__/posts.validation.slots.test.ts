import { describe, it, expect } from 'vitest';
import { extractBlockImageUploads } from '../posts.validation';

function file(name: string): Express.Multer.File {
  return { originalname: name } as Express.Multer.File;
}

describe('extractBlockImageUploads — three_images slots', () => {
  it('keeps valid slots 0..2', () => {
    const { uploads } = extractBlockImageUploads(
      [{ type: 'three_images', data: { _newImageSlots: [0, 2] } }],
      [file('a.jpg'), file('b.jpg')]
    );
    expect(uploads.map((u) => u.imageSlot)).toEqual([0, 2]);
  });

  it.each([[[1e9]], [[-1]], [[1.5]], [['1']], [[3]], [[1, 1]], ['oops']])(
    'rejects invalid slots %j with a 400',
    (slots) => {
      expect(() =>
        extractBlockImageUploads(
          [{ type: 'three_images', data: { _newImageSlots: slots } }],
          [file('a.jpg')]
        )
      ).toThrow('Invalid _newImageSlots format');
    }
  );
});
