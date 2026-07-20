import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Block, BlockData } from '@buro710/shared';
import type { DragEndEvent } from '@dnd-kit/core';

const { capturedOnDragEnd } = vi.hoisted(() => ({
  capturedOnDragEnd: { current: null as ((event: DragEndEvent) => void) | null },
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
  }) => {
    capturedOnDragEnd.current = onDragEnd;
    return children;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => children,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: {},
}));

vi.mock('../BlockItem', () => ({
  default: ({
    block,
    onDelete,
    onUpdate,
    onImageChange,
  }: {
    block: Block;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: BlockData) => void;
    onImageChange: (id: string, file: File | null) => void;
  }) => (
    <div data-testid={`block-${block.id}`}>
      <button onClick={() => onDelete(block.id)}>delete-{block.id}</button>
      <button onClick={() => onUpdate(block.id, { content: 'x' })}>update-{block.id}</button>
      <button onClick={() => onImageChange(block.id, null)}>image-{block.id}</button>
    </div>
  ),
}));

import BlocksList from '../BlocksList';

function makeBlock(id: string, sort_order: number): Block {
  return {
    id,
    post_id: 'post-1',
    type: 'text_full',
    data: { content: id },
    sort_order,
    created_at: '2026-07-18T10:00:00.000Z',
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  capturedOnDragEnd.current = null;
});

describe('BlocksList', () => {
  it('shows an empty-state message when there are no blocks', () => {
    render(
      <BlocksList
        blocks={[]}
        onUpdateBlock={vi.fn()}
        onDeleteBlock={vi.fn()}
        onReorderBlocks={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Додайте перший блок для створення сторінки')).toBeInTheDocument();
  });

  it('renders one BlockItem per block', () => {
    render(
      <BlocksList
        blocks={[makeBlock('a', 0), makeBlock('b', 1)]}
        onUpdateBlock={vi.fn()}
        onDeleteBlock={vi.fn()}
        onReorderBlocks={vi.fn()}
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('block-a')).toBeInTheDocument();
    expect(screen.getByTestId('block-b')).toBeInTheDocument();
  });

  it('forwards delete/update/image-change callbacks from a block item', () => {
    const onDeleteBlock = vi.fn();
    const onUpdateBlock = vi.fn();
    const onImageChange = vi.fn();
    render(
      <BlocksList
        blocks={[makeBlock('a', 0)]}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onReorderBlocks={vi.fn()}
        onImageChange={onImageChange}
      />
    );

    fireEvent.click(screen.getByText('delete-a'));
    fireEvent.click(screen.getByText('update-a'));
    fireEvent.click(screen.getByText('image-a'));

    expect(onDeleteBlock).toHaveBeenCalledWith('a');
    expect(onUpdateBlock).toHaveBeenCalledWith('a', { content: 'x' });
    expect(onImageChange).toHaveBeenCalledWith('a', null);
  });

  it('reorders blocks by id when a drag moves one block over another', () => {
    const onReorderBlocks = vi.fn();
    render(
      <BlocksList
        blocks={[makeBlock('a', 0), makeBlock('b', 1), makeBlock('c', 2)]}
        onUpdateBlock={vi.fn()}
        onDeleteBlock={vi.fn()}
        onReorderBlocks={onReorderBlocks}
        onImageChange={vi.fn()}
      />
    );

    capturedOnDragEnd.current!({
      active: { id: 'a' },
      over: { id: 'c' },
    } as DragEndEvent);

    expect(onReorderBlocks).toHaveBeenCalledWith(['b', 'c', 'a']);
  });

  it('does not reorder when a block is dropped on itself or outside any target', () => {
    const onReorderBlocks = vi.fn();
    render(
      <BlocksList
        blocks={[makeBlock('a', 0), makeBlock('b', 1)]}
        onUpdateBlock={vi.fn()}
        onDeleteBlock={vi.fn()}
        onReorderBlocks={onReorderBlocks}
        onImageChange={vi.fn()}
      />
    );

    capturedOnDragEnd.current!({ active: { id: 'a' }, over: { id: 'a' } } as DragEndEvent);
    capturedOnDragEnd.current!({ active: { id: 'a' }, over: null } as DragEndEvent);

    expect(onReorderBlocks).not.toHaveBeenCalled();
  });
});
