import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Block, BlockData } from '@buro710/shared';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('../editors/TextFullEditor', () => ({
  default: ({ onChange }: { onChange: (data: BlockData) => void }) => (
    <button onClick={() => onChange({ content: 'edited' })}>edit-text-full</button>
  ),
}));
vi.mock('../editors/ImageFullEditor', () => ({
  default: ({ onImageChange }: { onImageChange: (file: File | null) => void }) => (
    <button onClick={() => onImageChange(new File(['x'], 'a.jpg'))}>edit-image-full</button>
  ),
}));
vi.mock('../editors/TextImageEditor', () => ({
  default: ({ mirrored }: { mirrored: boolean }) => (
    <span>edit-text-image-{mirrored ? 'mirrored' : 'normal'}</span>
  ),
}));
vi.mock('../editors/ThreeImagesEditor', () => ({
  default: () => <span>edit-three-images</span>,
}));

import BlockItem from '../BlockItem';

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-1',
    post_id: 'post-1',
    type: 'text_full',
    data: { content: 'hi' },
    sort_order: 0,
    created_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BlockItem', () => {
  it('renders the human label for the block type and its position', () => {
    render(
      <BlockItem
        block={makeBlock()}
        index={2}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Текст на повну ширину')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('routes text_full blocks to TextFullEditor and forwards its onChange', () => {
    const onUpdate = vi.fn();
    render(
      <BlockItem
        block={makeBlock()}
        index={0}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('edit-text-full'));

    expect(onUpdate).toHaveBeenCalledWith('block-1', { content: 'edited' });
  });

  it('routes image_full blocks to ImageFullEditor and forwards its onImageChange', () => {
    const onImageChange = vi.fn();
    render(
      <BlockItem
        block={makeBlock({ type: 'image_full', data: { image_url: '' } })}
        index={0}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onImageChange={onImageChange}
      />
    );

    fireEvent.click(screen.getByText('edit-image-full'));

    expect(onImageChange).toHaveBeenCalledWith('block-1', expect.any(File));
  });

  it('marks image_text blocks as mirrored, but not text_image blocks', () => {
    const { rerender } = render(
      <BlockItem
        block={makeBlock({ type: 'text_image', data: { text: '', image_url: '' } })}
        index={0}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onImageChange={vi.fn()}
      />
    );
    expect(screen.getByText('edit-text-image-normal')).toBeInTheDocument();

    rerender(
      <BlockItem
        block={makeBlock({ id: 'block-2', type: 'image_text', data: { text: '', image_url: '' } })}
        index={0}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onImageChange={vi.fn()}
      />
    );
    expect(screen.getByText('edit-text-image-mirrored')).toBeInTheDocument();
  });

  it('routes three_images blocks to ThreeImagesEditor', () => {
    render(
      <BlockItem
        block={makeBlock({ type: 'three_images', data: { images: [] } })}
        index={0}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByText('edit-three-images')).toBeInTheDocument();
  });

  it('deletes the block only after the user confirms', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <BlockItem
        block={makeBlock()}
        index={0}
        onUpdate={vi.fn()}
        onDelete={onDelete}
        onImageChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Видалити блок' }));
    expect(onDelete).not.toHaveBeenCalled();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Видалити блок' }));
    expect(onDelete).toHaveBeenCalledWith('block-1');
  });
});
