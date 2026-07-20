import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

import SingleImageUpload from '../SingleImageUpload';
import { compressImage } from '../../../lib/compressImage';

function file(name: string, type = 'image/jpeg', size = 1024): File {
  const f = new File(['x'.repeat(size)], name, { type });
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SingleImageUpload', () => {
  it('shows the dropzone placeholder when there is no image', () => {
    render(<SingleImageUpload onImageChange={vi.fn()} />);

    expect(screen.getByText(/drag and drop image/i)).toBeInTheDocument();
  });

  it('shows the initial image url as a preview when no new file is selected', () => {
    render(<SingleImageUpload onImageChange={vi.fn()} initialImageUrl="https://x.test/a.jpg" />);

    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://x.test/a.jpg');
  });

  it('rejects a file with a disallowed type without calling onImageChange', async () => {
    const onImageChange = vi.fn();
    render(<SingleImageUpload onImageChange={onImageChange} />);
    const input = document.getElementById('single-image-upload') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file('a.gif', 'image/gif')] } });

    await waitFor(() =>
      expect(screen.getByText('Дозволені формати: JPEG, PNG')).toBeInTheDocument()
    );
    expect(onImageChange).not.toHaveBeenCalled();
    expect(compressImage).not.toHaveBeenCalled();
  });

  it('rejects a file larger than 10MB', async () => {
    const onImageChange = vi.fn();
    render(<SingleImageUpload onImageChange={onImageChange} />);
    const input = document.getElementById('single-image-upload') as HTMLInputElement;
    const tooLarge = file('big.jpg', 'image/jpeg', 11 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [tooLarge] } });

    await waitFor(() =>
      expect(screen.getByText('Розмір файлу не повинен перевищувати 10 МБ')).toBeInTheDocument()
    );
    expect(onImageChange).not.toHaveBeenCalled();
  });

  it('compresses and accepts a valid file, then previews it', async () => {
    const onImageChange = vi.fn();
    render(<SingleImageUpload onImageChange={onImageChange} />);
    const input = document.getElementById('single-image-upload') as HTMLInputElement;
    const validFile = file('photo.jpg');

    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() =>
      expect(compressImage).toHaveBeenCalledWith(validFile, expect.any(Function))
    );
    await waitFor(() => expect(onImageChange).toHaveBeenCalledWith(validFile));
  });

  it('shows an externally supplied error message', () => {
    render(<SingleImageUpload onImageChange={vi.fn()} error="Custom error" />);

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('removes the image and clears the error when the remove button is clicked', async () => {
    const onImageChange = vi.fn();
    render(
      <SingleImageUpload onImageChange={onImageChange} initialImageUrl="https://x.test/a.jpg" />
    );

    fireEvent.click(screen.getByTitle('Remove image'));

    expect(onImageChange).toHaveBeenCalledWith(null);
  });
});
