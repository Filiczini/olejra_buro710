import { describe, it, expect, vi, beforeEach } from 'vitest';

const started: string[] = [];

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  sizes = '';
  srcset = '';
  set src(value: string) {
    started.push(value);
    queueMicrotask(() => this.onload?.());
  }
}

describe('enqueueImagePreload', () => {
  beforeEach(() => {
    started.length = 0;
    vi.resetModules();
    vi.stubGlobal('Image', FakeImage);
  });

  it('downloads queued images in order, skipping duplicates', async () => {
    const { enqueueImagePreload } = await import('../imagePreloadQueue');
    enqueueImagePreload({ src: '/uploads/a.jpg' });
    enqueueImagePreload({ src: '/uploads/b.jpg' });
    enqueueImagePreload({ src: '/uploads/a.jpg' });

    await vi.waitFor(() => expect(started).toEqual(['/uploads/a.jpg', '/uploads/b.jpg']));
  });
});
