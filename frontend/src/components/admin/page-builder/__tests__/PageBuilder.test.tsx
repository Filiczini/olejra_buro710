import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import PageBuilder from '../PageBuilder';
import type { Block, BlockType } from '../../../../types/block';

vi.mock('@iconify-icon/react', () => ({
  Icon: ({ icon, ...props }: Record<string, unknown>) => (
    <span data-testid={`icon-${icon}`} {...props} />
  ),
}));

vi.mock('../BlocksList', () => ({
  default: ({
    blocks,
    onDeleteBlock,
  }: {
    blocks: Block[];
    onDeleteBlock: (id: string) => void;
  }) => (
    <div data-testid="blocks-list">
      {blocks.map((b) => (
        <div key={b.id} data-testid={`block-${b.id}`}>
          <span>{b.type}</span>
          <button onClick={() => onDeleteBlock(b.id)}>Delete {b.id}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../AddBlockMenu', () => ({
  default: ({ onAddBlock }: { onAddBlock: (type: BlockType) => void }) => (
    <div data-testid="add-block-menu">
      <button onClick={() => onAddBlock('text_full')}>Add text_full</button>
      <button onClick={() => onAddBlock('image_full')}>Add image_full</button>
    </div>
  ),
}));

describe('PageBuilder', () => {
  const initialBlocks: Block[] = [
    {
      id: 'block-1',
      post_id: 'post-1',
      type: 'text_full',
      data: { content: 'Hello' },
      sort_order: 0,
      created_at: '2024-01-01',
    },
  ];

  let onChange: Mock;
  let onImageChange: Mock;

  beforeEach(() => {
    onChange = vi.fn();
    onImageChange = vi.fn();
  });

  it('renders initial blocks', () => {
    render(
      <PageBuilder
        initialBlocks={initialBlocks}
        onChange={onChange}
        onImageChange={onImageChange}
      />
    );
    expect(screen.getByTestId('block-block-1')).toBeInTheDocument();
    expect(screen.getByText('text_full')).toBeInTheDocument();
  });

  it('calls onChange when block is added', () => {
    render(
      <PageBuilder
        initialBlocks={initialBlocks}
        onChange={onChange}
        onImageChange={onImageChange}
      />
    );
    fireEvent.click(screen.getByText('Add text_full'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg).toHaveLength(2);
    expect(callArg[0].type).toBe('text_full');
    expect(callArg[1].type).toBe('text_full');
  });

  it('calls onChange when block is deleted', () => {
    render(
      <PageBuilder
        initialBlocks={initialBlocks}
        onChange={onChange}
        onImageChange={onImageChange}
      />
    );
    fireEvent.click(screen.getByText('Delete block-1'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg).toHaveLength(0);
  });
});
