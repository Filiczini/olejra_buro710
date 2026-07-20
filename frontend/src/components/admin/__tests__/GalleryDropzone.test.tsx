import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryDropzone from '../GalleryDropzone';

function baseProps() {
  return {
    isDragging: false,
    onDrop: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onFileChange: vi.fn(),
    rejectedFiles: [] as string[],
    compressMsg: null as string | null,
  };
}

describe('GalleryDropzone', () => {
  it('calls onFileChange when files are selected via the input', () => {
    const props = baseProps();
    render(<GalleryDropzone {...props} />);
    const input = document.getElementById('gallery-upload') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(props.onFileChange).toHaveBeenCalled();
  });

  it('calls onDrop/onDragOver/onDragLeave on the drop area', () => {
    const props = baseProps();
    const { container } = render(<GalleryDropzone {...props} />);
    const dropArea = container.querySelector('.border-dashed')!;

    fireEvent.dragOver(dropArea);
    fireEvent.drop(dropArea);
    fireEvent.dragLeave(dropArea);

    expect(props.onDragOver).toHaveBeenCalled();
    expect(props.onDrop).toHaveBeenCalled();
    expect(props.onDragLeave).toHaveBeenCalled();
  });

  it('lists rejected file messages', () => {
    const props = baseProps();
    render(<GalleryDropzone {...props} rejectedFiles={['a.gif: тільки JPEG та PNG']} />);

    expect(screen.getByText('a.gif: тільки JPEG та PNG')).toBeInTheDocument();
  });

  it('shows the compression progress message', () => {
    const props = baseProps();
    render(<GalleryDropzone {...props} compressMsg="Стискаємо 2 з 3 фото..." />);

    expect(screen.getByText('Стискаємо 2 з 3 фото...')).toBeInTheDocument();
  });
});
