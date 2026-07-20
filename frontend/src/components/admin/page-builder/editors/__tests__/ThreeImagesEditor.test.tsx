import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

import ThreeImagesEditor from '../ThreeImagesEditor';
import { compressImage } from '../../../../../lib/compressImage';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ThreeImagesEditor', () => {
  it('falls back to 3 empty slots when data.images is missing', () => {
    render(
      <ThreeImagesEditor
        blockId="b1"
        data={{ images: [] }}
        onChange={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getAllByText(/завантажити зображення/i)).toHaveLength(3);
  });

  it('uploads into a specific slot and reports the slot field to onImageChange', async () => {
    const onImageChange = vi.fn();
    render(
      <ThreeImagesEditor
        blockId="b1"
        data={{ images: [] }}
        onChange={vi.fn()}
        onImageChange={onImageChange}
      />
    );
    const input = document.getElementById('b1-img1-upload') as HTMLInputElement;
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(compressImage).toHaveBeenCalled());
    await waitFor(() => expect(onImageChange).toHaveBeenCalledWith(file, 'images.1'));
  });

  it('updates the alt text of a single slot without touching the others', () => {
    const onChange = vi.fn();
    const images = [
      { url: 'a.jpg', alt: 'A' },
      { url: 'b.jpg', alt: 'B' },
      { url: 'c.jpg', alt: 'C' },
    ];
    render(
      <ThreeImagesEditor
        blockId="b1"
        data={{ images }}
        onChange={onChange}
        onImageChange={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Alt-текст 2'), { target: { value: 'New B' } });

    expect(onChange).toHaveBeenCalledWith({
      images: [
        { url: 'a.jpg', alt: 'A' },
        { url: 'b.jpg', alt: 'New B' },
        { url: 'c.jpg', alt: 'C' },
      ],
    });
  });

  it('removes a single slot, clearing only that image', () => {
    const onChange = vi.fn();
    const onImageChange = vi.fn();
    const images = [
      { url: 'a.jpg', alt: 'A' },
      { url: 'b.jpg', alt: 'B' },
      { url: 'c.jpg', alt: 'C' },
    ];
    const { container } = render(
      <ThreeImagesEditor
        blockId="b1"
        data={{ images }}
        onChange={onChange}
        onImageChange={onImageChange}
      />
    );
    const removeButtons = container.querySelectorAll('button.bg-red-500');

    fireEvent.click(removeButtons[0]);

    expect(onImageChange).toHaveBeenCalledWith(null, 'images.0');
    expect(onChange).toHaveBeenCalledWith({
      images: [
        { url: '', alt: '' },
        { url: 'b.jpg', alt: 'B' },
        { url: 'c.jpg', alt: 'C' },
      ],
    });
  });
});
