import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThreeImagesBlock from '../ThreeImagesBlock';
import type { ThreeImagesData } from '@buro710/shared';

describe('ThreeImagesBlock', () => {
  it('renders 3 images in a grid', () => {
    const data: ThreeImagesData = {
      images: [
        { url: 'https://example.com/1.jpg', alt: 'Image 1' },
        { url: 'https://example.com/2.jpg', alt: 'Image 2' },
        { url: 'https://example.com/3.jpg', alt: 'Image 3' },
      ],
    };
    render(<ThreeImagesBlock data={data} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(3);
  });

  it('does not render when all image urls are empty', () => {
    const data: ThreeImagesData = {
      images: [
        { url: '', alt: '' },
        { url: '', alt: '' },
        { url: '', alt: '' },
      ],
    };
    const { container } = render(<ThreeImagesBlock data={data} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders partial images (only some have urls)', () => {
    const data: ThreeImagesData = {
      images: [
        { url: 'https://example.com/1.jpg', alt: 'First' },
        { url: '', alt: '' },
        { url: 'https://example.com/3.jpg', alt: 'Third' },
      ],
    };
    render(<ThreeImagesBlock data={data} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(2);
  });

  it('images have correct alt text', () => {
    const data: ThreeImagesData = {
      images: [
        { url: 'https://example.com/1.jpg', alt: 'Kitchen view' },
        { url: 'https://example.com/2.jpg', alt: 'Living room' },
        { url: 'https://example.com/3.jpg', alt: 'Bedroom' },
      ],
    };
    render(<ThreeImagesBlock data={data} />);
    expect(screen.getByAltText('Kitchen view')).toBeInTheDocument();
    expect(screen.getByAltText('Living room')).toBeInTheDocument();
    expect(screen.getByAltText('Bedroom')).toBeInTheDocument();
  });
});
