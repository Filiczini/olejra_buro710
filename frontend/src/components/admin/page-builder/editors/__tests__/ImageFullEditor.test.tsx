import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

import ImageFullEditor from '../ImageFullEditor';
import { compressImage } from '../../../../../lib/compressImage';
import type { ImageFullData } from '@buro710/shared';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImageFullEditor', () => {
  it('shows the upload dropzone when there is no image yet', () => {
    render(
      <ImageFullEditor
        blockId="b1"
        data={{ image_url: '' }}
        onChange={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Натисніть або перетягніть зображення')).toBeInTheDocument();
  });

  it('shows the existing image_url as a preview', () => {
    render(
      <ImageFullEditor
        blockId="b1"
        data={{ image_url: 'https://x.test/a.jpg' }}
        onChange={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://x.test/a.jpg');
  });

  it('compresses a newly selected file and calls onImageChange with it', async () => {
    const onImageChange = vi.fn();
    render(
      <ImageFullEditor
        blockId="b1"
        data={{ image_url: '' }}
        onChange={vi.fn()}
        onImageChange={onImageChange}
      />
    );
    const input = document.getElementById('b1-image') as HTMLInputElement;
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(compressImage).toHaveBeenCalled());
    await waitFor(() => expect(onImageChange).toHaveBeenCalledWith(file));
  });

  it('removes the image and clears the block data on remove', () => {
    const onChange = vi.fn();
    const onImageChange = vi.fn();
    render(
      <ImageFullEditor
        blockId="b1"
        data={{ image_url: 'https://x.test/a.jpg', alt: 'Old alt', caption: 'Old caption' }}
        onChange={onChange}
        onImageChange={onImageChange}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onImageChange).toHaveBeenCalledWith(null);
    expect(onChange).toHaveBeenCalledWith({ image_url: '', alt: '', caption: '' });
  });

  it('merges caption and alt-text changes into the existing data', () => {
    const onChange = vi.fn();
    const data: ImageFullData = { image_url: 'a.jpg' };
    render(
      <ImageFullEditor blockId="b1" data={data} onChange={onChange} onImageChange={vi.fn()} />
    );

    fireEvent.change(screen.getByPlaceholderText('Living Space'), {
      target: { value: 'Kitchen view' },
    });
    fireEvent.change(screen.getByPlaceholderText('Опис зображення'), {
      target: { value: 'A bright kitchen' },
    });

    expect(onChange).toHaveBeenNthCalledWith(1, { image_url: 'a.jpg', caption: 'Kitchen view' });
    expect(onChange).toHaveBeenNthCalledWith(2, { image_url: 'a.jpg', alt: 'A bright kitchen' });
  });
});
