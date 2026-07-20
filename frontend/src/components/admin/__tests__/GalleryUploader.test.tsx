import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

import GalleryUploader from '../GalleryUploader';
import { compressImage } from '../../../lib/compressImage';

function file(name: string, type = 'image/jpeg', size = 1024): File {
  return new File(['x'.repeat(size)], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  });
});

describe('GalleryUploader', () => {
  it('renders existing images and newly added files as preview tiles', () => {
    render(
      <GalleryUploader
        images={['existing.jpg']}
        onImagesChange={vi.fn()}
        newFiles={[file('new.jpg')]}
        onNewFilesChange={vi.fn()}
      />
    );

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('Нове')).toBeInTheDocument();
  });

  it('rejects files with an invalid type or oversized files, listing the reason', async () => {
    const onNewFilesChange = vi.fn();
    render(
      <GalleryUploader
        images={[]}
        onImagesChange={vi.fn()}
        newFiles={[]}
        onNewFilesChange={onNewFilesChange}
      />
    );
    const input = document.getElementById('gallery-upload') as HTMLInputElement;
    const badType = file('a.gif', 'image/gif');
    const tooBig = file('big.jpg', 'image/jpeg', 11 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [badType, tooBig] } });

    await waitFor(() => {
      expect(screen.getByText('a.gif: тільки JPEG та PNG')).toBeInTheDocument();
      expect(screen.getByText('big.jpg: перевищує 10 МБ')).toBeInTheDocument();
    });
    expect(onNewFilesChange).not.toHaveBeenCalled();
  });

  it('compresses valid files and appends them to the existing new-file list', async () => {
    const existing = file('existing-new.jpg');
    const onNewFilesChange = vi.fn();
    render(
      <GalleryUploader
        images={[]}
        onImagesChange={vi.fn()}
        newFiles={[existing]}
        onNewFilesChange={onNewFilesChange}
      />
    );
    const input = document.getElementById('gallery-upload') as HTMLInputElement;
    const added = file('added.jpg');

    fireEvent.change(input, { target: { files: [added] } });

    await waitFor(() => expect(compressImage).toHaveBeenCalledWith(added));
    await waitFor(() => expect(onNewFilesChange).toHaveBeenCalledWith([existing, added]));
  });

  it('removes an existing image via onImagesChange without touching new files', () => {
    const onImagesChange = vi.fn();
    render(
      <GalleryUploader
        images={['a.jpg', 'b.jpg']}
        onImagesChange={onImagesChange}
        newFiles={[]}
        onNewFilesChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByTitle('Видалити')[0]);

    expect(onImagesChange).toHaveBeenCalledWith(['b.jpg']);
  });

  it('removes a new file via onNewFilesChange without touching existing images', () => {
    const newFile = file('new.jpg');
    const onNewFilesChange = vi.fn();
    render(
      <GalleryUploader
        images={['a.jpg']}
        onImagesChange={vi.fn()}
        newFiles={[newFile]}
        onNewFilesChange={onNewFilesChange}
      />
    );

    fireEvent.click(screen.getAllByTitle('Видалити')[1]);

    expect(onNewFilesChange).toHaveBeenCalledWith([]);
  });

  it('commits a drag reorder to both existing and new image lists', () => {
    const onImagesChange = vi.fn();
    const onNewFilesChange = vi.fn();
    const newFile = file('new.jpg');
    render(
      <GalleryUploader
        images={['a.jpg', 'b.jpg']}
        onImagesChange={onImagesChange}
        newFiles={[newFile]}
        onNewFilesChange={onNewFilesChange}
      />
    );
    const tiles = screen.getAllByRole('img').map((img) => img.closest('div')!);

    fireEvent.dragStart(tiles[0]);
    fireEvent.dragOver(tiles[2]);
    fireEvent.dragEnd(tiles[2]);

    expect(onImagesChange).toHaveBeenCalledWith(['b.jpg', 'a.jpg']);
    expect(onNewFilesChange).toHaveBeenCalledWith([newFile]);
  });
});
