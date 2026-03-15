import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ImageFullBlock from '../ImageFullBlock';
import type { ImageFullData } from '../../../types/block';

describe('ImageFullBlock', () => {
  it('renders image with correct src and alt', () => {
    const data: ImageFullData = {
      image_url: 'https://example.com/photo.jpg',
      alt: 'A beautiful photo',
    };
    render(<ImageFullBlock data={data} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'A beautiful photo');
  });

  it('does not render when image_url is empty', () => {
    const data: ImageFullData = { image_url: '' };
    const { container } = render(<ImageFullBlock data={data} />);
    expect(container.innerHTML).toBe('');
  });

  it('uses caption as alt fallback', () => {
    const data: ImageFullData = {
      image_url: 'https://example.com/photo.jpg',
      caption: 'Caption text',
    };
    render(<ImageFullBlock data={data} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Caption text');
  });
});
