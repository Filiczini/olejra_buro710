import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlockRenderer from '../BlockRenderer';
import type { Block } from '../../../types/block';

vi.mock('@iconify-icon/react', () => ({
  Icon: ({ icon, ...props }: Record<string, unknown>) => (
    <span data-testid={`icon-${icon}`} {...props} />
  ),
}));

function makeBlock(overrides: Partial<Block> & Pick<Block, 'type' | 'data'>): Block {
  return {
    id: `block-${Math.random()}`,
    post_id: 'post-1',
    sort_order: 0,
    created_at: '2024-01-01',
    ...overrides,
  };
}

describe('BlockRenderer', () => {
  it('renders nothing when blocks array is empty', () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders correct component for text_full block type', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'text_full', data: { content: 'Full text content' } }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByText(/"Full text content"/)).toBeInTheDocument();
  });

  it('renders correct component for image_full block type', () => {
    const blocks: Block[] = [
      makeBlock({
        type: 'image_full',
        data: { image_url: 'https://example.com/img.jpg', alt: 'Test image' },
      }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders correct component for text_image block type', () => {
    const blocks: Block[] = [
      makeBlock({
        type: 'text_image',
        data: { text: 'Left text', image_url: 'https://example.com/img.jpg' },
      }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByText('Left text')).toBeInTheDocument();
  });

  it('renders correct component for image_text block type (mirrored)', () => {
    const blocks: Block[] = [
      makeBlock({
        type: 'image_text',
        data: { text: 'Right text', image_url: 'https://example.com/img.jpg' },
      }),
    ];
    const { container } = render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByText('Right text')).toBeInTheDocument();
    // image_text passes mirrored=true, so image div gets md:order-1
    expect(container.querySelector('.md\\:order-1')).toBeInTheDocument();
  });

  it('renders correct component for three_images block type', () => {
    const blocks: Block[] = [
      makeBlock({
        type: 'three_images',
        data: {
          images: [
            { url: 'https://example.com/1.jpg', alt: 'One' },
            { url: 'https://example.com/2.jpg', alt: 'Two' },
            { url: 'https://example.com/3.jpg', alt: 'Three' },
          ],
        },
      }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('handles unknown block type gracefully', () => {
    const blocks: Block[] = [
      makeBlock({
        type: 'unknown_type' as Block['type'],
        data: { content: 'should not appear' } as Block['data'],
      }),
    ];
    const { container } = render(<BlockRenderer blocks={blocks} />);
    // The wrapper div is still rendered, but no block content inside
    expect(container.querySelector('.w-full')).toBeInTheDocument();
    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
  });
});
