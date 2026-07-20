import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TextFullEditor from '../TextFullEditor';
import type { TextFullData } from '@buro710/shared';

describe('TextFullEditor', () => {
  it('merges a content change into the existing data', () => {
    const onChange = vi.fn();
    const data: TextFullData = { content: '', label: 'Existing label' };
    render(<TextFullEditor blockId="b1" data={data} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Введіть текст цитати...'), {
      target: { value: 'New content' },
    });

    expect(onChange).toHaveBeenCalledWith({ content: 'New content', label: 'Existing label' });
  });

  it('updates the label field independently', () => {
    const onChange = vi.fn();
    render(<TextFullEditor blockId="b1" data={{ content: 'x' }} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('The Concept'), {
      target: { value: 'The Vision' },
    });

    expect(onChange).toHaveBeenCalledWith({ content: 'x', label: 'The Vision' });
  });

  it('updates the stat fields (area/months/year)', () => {
    const onChange = vi.fn();
    render(<TextFullEditor blockId="b1" data={{ content: 'x' }} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Площа (м²)'), { target: { value: '120' } });
    fireEvent.change(screen.getByPlaceholderText('Місяців'), { target: { value: '6' } });
    fireEvent.change(screen.getByPlaceholderText('Рік'), { target: { value: '2026' } });

    expect(onChange).toHaveBeenNthCalledWith(1, { content: 'x', area: '120' });
    expect(onChange).toHaveBeenNthCalledWith(2, { content: 'x', months: '6' });
    expect(onChange).toHaveBeenNthCalledWith(3, { content: 'x', year: '2026' });
  });

  it('scopes field ids to the given blockId', () => {
    render(<TextFullEditor blockId="my-block" data={{ content: '' }} onChange={vi.fn()} />);

    expect(document.getElementById('my-block-content')).toBeInTheDocument();
    expect(document.getElementById('my-block-label')).toBeInTheDocument();
  });
});
