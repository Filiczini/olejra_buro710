import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextImageBlock from '../TextImageBlock';
import type { TextImageData } from '../../../types/block';

vi.mock('@iconify-icon/react', () => ({
  Icon: ({ icon, ...props }: Record<string, unknown>) => (
    <span data-testid={`icon-${icon}`} {...props} />
  ),
}));

describe('TextImageBlock', () => {
  it('renders text and image', () => {
    const data: TextImageData = {
      text: 'Some description',
      image_url: 'https://example.com/img.jpg',
    };
    render(<TextImageBlock data={data} />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders title, label, icon', () => {
    const data: TextImageData = {
      text: 'Body text',
      image_url: 'https://example.com/img.jpg',
      title: 'Block Title',
      label: 'Block Label',
      icon: 'solar:armchair-2-linear',
    };
    render(<TextImageBlock data={data} />);
    expect(screen.getByText('Block Title')).toBeInTheDocument();
    expect(screen.getByText('Block Label')).toBeInTheDocument();
    expect(screen.getByTestId('icon-solar:armchair-2-linear')).toBeInTheDocument();
  });

  it('renders features list', () => {
    const data: TextImageData = {
      text: 'Text',
      image_url: 'https://example.com/img.jpg',
      features: ['Feature A', 'Feature B', 'Feature C'],
    };
    render(<TextImageBlock data={data} />);
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
    expect(screen.getByText('Feature C')).toBeInTheDocument();
  });

  it('does not render when both text and image_url are empty', () => {
    const data: TextImageData = { text: '', image_url: '' };
    const { container } = render(<TextImageBlock data={data} />);
    expect(container.innerHTML).toBe('');
  });

  it('handles mirrored prop (changes order classes)', () => {
    const data: TextImageData = {
      text: 'Mirrored text',
      image_url: 'https://example.com/img.jpg',
    };

    const { container: mirroredContainer } = render(<TextImageBlock data={data} mirrored={true} />);
    // When mirrored, image gets md:order-1, text gets md:order-2
    const mirroredImageDiv = mirroredContainer.querySelector('.md\\:order-1');
    const mirroredTextDiv = mirroredContainer.querySelector('.md\\:order-2');
    expect(mirroredImageDiv).toBeInTheDocument();
    expect(mirroredTextDiv).toBeInTheDocument();

    const { container: normalContainer } = render(<TextImageBlock data={data} mirrored={false} />);
    // When not mirrored, image gets md:order-2, text gets md:order-1
    const normalImageDiv = normalContainer.querySelector('.md\\:order-2');
    const normalTextDiv = normalContainer.querySelector('.md\\:order-1');
    expect(normalImageDiv).toBeInTheDocument();
    expect(normalTextDiv).toBeInTheDocument();
  });
});
