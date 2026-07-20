import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostGalleryBlock from '../PostGalleryBlock';

const images = ['a.jpg', 'b.jpg', 'c.jpg'];

describe('PostGalleryBlock', () => {
  it('renders nothing when there are no images', () => {
    const { container } = render(<PostGalleryBlock images={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders every image', () => {
    render(<PostGalleryBlock images={images} title="My project" />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByAltText('My project — зображення 2')).toBeInTheDocument();
  });

  it('opens the lightbox on the clicked image, at the correct index', () => {
    render(<PostGalleryBlock images={images} />);

    fireEvent.click(screen.getAllByRole('img')[1].parentElement!);

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('starts closing the lightbox when its close button is clicked', () => {
    render(<PostGalleryBlock images={images} />);
    fireEvent.click(screen.getAllByRole('img')[0].parentElement!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Закрити' }));

    expect(screen.getByRole('dialog').className).toContain('animate-fade-out');
  });

  it('wraps around when navigating past the first/last image', () => {
    render(<PostGalleryBlock images={images} />);
    fireEvent.click(screen.getAllByRole('img')[0].parentElement!);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Попереднє' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Наступне' }));
    fireEvent.click(screen.getByRole('button', { name: 'Наступне' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });
});
