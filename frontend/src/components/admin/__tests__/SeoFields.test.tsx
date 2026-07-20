import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SeoFields from '../SeoFields';

function baseProps() {
  return {
    seoTitle: '',
    seoDescription: '',
    onSeoTitleChange: vi.fn(),
    onSeoDescriptionChange: vi.fn(),
  };
}

describe('SeoFields', () => {
  it('is collapsed by default, showing only the summary row', () => {
    render(<SeoFields {...baseProps()} />);

    expect(screen.queryByLabelText('SEO Title')).not.toBeInTheDocument();
  });

  it('expands to show the fields when the header is clicked', () => {
    render(<SeoFields {...baseProps()} />);

    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(screen.getByPlaceholderText('Заголовок для пошукових систем')).toBeInTheDocument();
  });

  it('shows a "Заповнено" badge once either SEO field has content', () => {
    render(<SeoFields {...baseProps()} seoTitle="Some title" />);

    expect(screen.getByText('Заповнено')).toBeInTheDocument();
  });

  it('calls onSeoTitleChange/onSeoDescriptionChange as the user types', () => {
    const onSeoTitleChange = vi.fn();
    const onSeoDescriptionChange = vi.fn();
    render(
      <SeoFields
        {...baseProps()}
        onSeoTitleChange={onSeoTitleChange}
        onSeoDescriptionChange={onSeoDescriptionChange}
      />
    );
    fireEvent.click(screen.getByText('SEO налаштування'));

    fireEvent.change(screen.getByPlaceholderText('Заголовок для пошукових систем'), {
      target: { value: 'Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('Опис для пошукових систем'), {
      target: { value: 'Description' },
    });

    expect(onSeoTitleChange).toHaveBeenCalledWith('Title');
    expect(onSeoDescriptionChange).toHaveBeenCalledWith('Description');
  });

  it('turns the title counter red past 60 characters', () => {
    render(<SeoFields {...baseProps()} seoTitle={'a'.repeat(61)} />);
    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(screen.getByText('61/60').className).toContain('text-red-500');
  });

  it('shows field errors when provided', () => {
    render(
      <SeoFields
        {...baseProps()}
        errors={{ seo_title: 'Title too long', seo_description: 'Description too long' }}
      />
    );
    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(screen.getByText('Title too long')).toBeInTheDocument();
    expect(screen.getByText('Description too long')).toBeInTheDocument();
  });

  it('does not render the OG image field when onOgImageChange is not provided', () => {
    render(<SeoFields {...baseProps()} />);
    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(screen.queryByText('OG Image (для соціальних мереж)')).not.toBeInTheDocument();
  });

  it('reads the selected OG image as a data URL and calls onOgImageChange', async () => {
    const onOgImageChange = vi.fn();
    render(<SeoFields {...baseProps()} onOgImageChange={onOgImageChange} />);
    fireEvent.click(screen.getByText('SEO налаштування'));
    const input = document.getElementById('og-image-upload') as HTMLInputElement;
    const file = new File(['x'], 'og.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onOgImageChange).toHaveBeenCalledWith(file);
    await waitFor(() => expect(screen.getByAltText('OG Preview')).toBeInTheDocument());
  });

  it('removes the OG image preview and calls onOgImageChange(null)', async () => {
    const onOgImageChange = vi.fn();
    render(
      <SeoFields
        {...baseProps()}
        onOgImageChange={onOgImageChange}
        ogImageUrl="https://x.test/og.jpg"
      />
    );
    fireEvent.click(screen.getByText('SEO налаштування'));
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[buttons.length - 1]);

    expect(onOgImageChange).toHaveBeenCalledWith(null);
  });
});
