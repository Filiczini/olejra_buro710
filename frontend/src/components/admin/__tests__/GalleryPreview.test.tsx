import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryPreview from '../GalleryPreview';
import type { ImageItem } from '../GalleryUploader';

const items: ImageItem[] = [
  { id: 'existing-0-a.jpg', url: 'a.jpg', isNew: false },
  { id: 'new-0-b.jpg', url: 'blob:b', isNew: true },
];

describe('GalleryPreview', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(
      <GalleryPreview
        items={[]}
        draggedIndex={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragEnd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('marks only newly-added images with the "Нове" badge', () => {
    render(
      <GalleryPreview
        items={items}
        draggedIndex={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragEnd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getAllByText('Нове')).toHaveLength(1);
  });

  it('calls onRemove with the clicked item', () => {
    const onRemove = vi.fn();
    render(
      <GalleryPreview
        items={items}
        draggedIndex={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragEnd={vi.fn()}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getAllByTitle('Видалити')[1]);

    expect(onRemove).toHaveBeenCalledWith(items[1]);
  });

  it('calls onDragStart/onDragOver/onDragEnd for drag reordering', () => {
    const onDragStart = vi.fn();
    const onDragOver = vi.fn();
    const onDragEnd = vi.fn();
    render(
      <GalleryPreview
        items={items}
        draggedIndex={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onRemove={vi.fn()}
      />
    );
    const firstTile = screen.getAllByRole('img')[0].closest('div')!;

    fireEvent.dragStart(firstTile);
    fireEvent.dragOver(firstTile);
    fireEvent.dragEnd(firstTile);

    expect(onDragStart).toHaveBeenCalledWith(0);
    expect(onDragOver).toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalled();
  });
});
