import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostHeroForm from '../PostHeroForm';
import type { PostHeroFormData } from '../../../types/post';

vi.mock('../../../lib/compressImage', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

function data(overrides: Partial<PostHeroFormData> = {}): PostHeroFormData {
  return {
    hero_title: '',
    hero_subtitle: '',
    hero_tags: [],
    hero_location: '',
    hero_year: '',
    ...overrides,
  };
}

describe('PostHeroForm', () => {
  it('merges a title change into the existing data without dropping other fields', () => {
    const onChange = vi.fn();
    render(<PostHeroForm data={data({ hero_location: 'Kyiv' })} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Введіть заголовок hero секції'), {
      target: { value: 'New title' },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hero_title: 'New title', hero_location: 'Kyiv' })
    );
  });

  it('merges a subtitle change and reports the field on blur', () => {
    const onChange = vi.fn();
    const onBlurField = vi.fn();
    render(<PostHeroForm data={data()} onChange={onChange} onBlurField={onBlurField} />);
    const textarea = screen.getByPlaceholderText('Короткий опис сторінки');

    fireEvent.change(textarea, { target: { value: 'Subtitle text' } });
    fireEvent.blur(textarea, { target: { value: 'Subtitle text' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hero_subtitle: 'Subtitle text' })
    );
    expect(onBlurField).toHaveBeenCalledWith('hero_subtitle', 'Subtitle text');
  });

  it('merges a tag added through the embedded TagInput', () => {
    const onChange = vi.fn();
    render(<PostHeroForm data={data()} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Введіть тег і натисніть Enter');

    fireEvent.change(input, { target: { value: 'modern' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hero_tags: ['modern'] }));
  });

  it('shows field-level validation errors', () => {
    render(
      <PostHeroForm
        data={data()}
        onChange={vi.fn()}
        errors={{ hero_title: 'Title required', hero_subtitle: 'Subtitle required' }}
      />
    );

    expect(screen.getByText('Title required')).toBeInTheDocument();
    expect(screen.getByText('Subtitle required')).toBeInTheDocument();
  });
});
