import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { Block } from '@buro710/shared';
import { PostImageViewer } from '../PostImageViewer';
import BlockRenderer from '../BlockRenderer';
import ImageFullBlock from '../ImageFullBlock';
import { collectPostImages } from '../../../lib/collectPostImages';

const blocks = [
  { id: '1', type: 'image_full', data: { image_url: '/a.jpg' }, sort_order: 0 },
  {
    id: '2',
    type: 'three_images',
    data: { images: [{ url: '/b.jpg' }, { url: '' }, { url: '/c.jpg' }] },
    sort_order: 1,
  },
  { id: '3', type: 'text_image', data: { text: 'hi', image_url: '/d.jpg' }, sort_order: 2 },
  { id: '4', type: 'text_full', data: { content: 'text' }, sort_order: 3 },
] as unknown as Block[];

describe('collectPostImages', () => {
  it('lists block images in page order, then the gallery, without blanks or duplicates', () => {
    expect(collectPostImages(blocks, ['/g1.jpg', '/a.jpg'])).toEqual([
      '/a.jpg',
      '/b.jpg',
      '/c.jpg',
      '/d.jpg',
      '/g1.jpg',
    ]);
  });
});

describe('PostImageViewer', () => {
  it('opens the clicked content image in the lightbox and lets you page on to the gallery', () => {
    const images = collectPostImages(blocks, ['/g1.jpg']);
    render(
      <PostImageViewer images={images}>
        <BlockRenderer blocks={blocks} />
      </PostImageViewer>
    );

    const buttons = screen.getAllByRole('button', { name: 'Відкрити зображення' });
    expect(buttons).toHaveLength(4);

    fireEvent.click(buttons[3]); // text_image photo, /d.jpg
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/d.jpg');
    expect(within(dialog).getByText('4 / 5')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Наступне' }));
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/g1.jpg');
  });

  it('keeps images static outside a post page', () => {
    render(<ImageFullBlock data={{ image_url: '/a.jpg' }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
