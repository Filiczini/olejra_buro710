import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

import TextImageEditor from '../TextImageEditor';
import { compressImage } from '../../../../../lib/compressImage';
import type { TextImageData } from '@buro710/shared';

function data(overrides: Partial<TextImageData> = {}): TextImageData {
  return { text: '', image_url: '', ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TextImageEditor', () => {
  it('merges a title/text change into the existing data', () => {
    const onChange = vi.fn();
    render(
      <TextImageEditor
        blockId="b1"
        data={data({ title: 'Old' })}
        onChange={onChange}
        onImageChange={vi.fn()}
        mirrored={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Organic Textures'), {
      target: { value: 'New title' },
    });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'New title' }));
  });

  it('adds a feature through the embedded FeatureTagsInput', () => {
    const onChange = vi.fn();
    render(
      <TextImageEditor
        blockId="b1"
        data={data()}
        onChange={onChange}
        onImageChange={vi.fn()}
        mirrored={false}
      />
    );
    const input = screen.getByPlaceholderText('Додати особливість');

    fireEvent.change(input, { target: { value: 'Balcony' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ features: ['Balcony'] }));
  });

  it('compresses a newly selected image and calls onImageChange', async () => {
    const onImageChange = vi.fn();
    render(
      <TextImageEditor
        blockId="b1"
        data={data()}
        onChange={vi.fn()}
        onImageChange={onImageChange}
        mirrored={false}
      />
    );
    const input = document.getElementById('b1-image') as HTMLInputElement;
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(compressImage).toHaveBeenCalled());
    await waitFor(() => expect(onImageChange).toHaveBeenCalledWith(file));
  });

  it('removes the image and clears image_url/image_alt while keeping other fields', () => {
    const onChange = vi.fn();
    const onImageChange = vi.fn();
    const { container } = render(
      <TextImageEditor
        blockId="b1"
        data={data({ image_url: 'a.jpg', image_alt: 'Alt', title: 'Kept' })}
        onChange={onChange}
        onImageChange={onImageChange}
        mirrored={false}
      />
    );

    fireEvent.click(container.querySelector('button.bg-red-500')!);

    expect(onImageChange).toHaveBeenCalledWith(null);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ image_url: '', image_alt: '', title: 'Kept' })
    );
  });

  it('places text before the image when not mirrored, and after when mirrored', () => {
    const { container: normal } = render(
      <TextImageEditor
        blockId="b1"
        data={data()}
        onChange={vi.fn()}
        onImageChange={vi.fn()}
        mirrored={false}
      />
    );
    const textCol = normal.querySelector('.md\\:order-1');
    expect(textCol?.textContent).toContain('Заголовок');

    const { container: mirrored } = render(
      <TextImageEditor
        blockId="b2"
        data={data()}
        onChange={vi.fn()}
        onImageChange={vi.fn()}
        mirrored
      />
    );
    const imageColFirst = mirrored.querySelector('.md\\:order-1');
    expect(imageColFirst?.textContent).toContain('Зображення');
  });
});
