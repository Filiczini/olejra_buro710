import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TagInput from '../TagInput';

describe('TagInput', () => {
  it('adds a tag on Enter and clears the input', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('Введіть тег і натисніть Enter');

    fireEvent.change(input, { target: { value: 'interior' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onTagsChange).toHaveBeenCalledWith(['interior']);
  });

  it('does not add a duplicate tag', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={['interior']} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('');

    fireEvent.change(input, { target: { value: 'interior' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it('does not add a tag once maxTags is reached', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={['a', 'b']} onTagsChange={onTagsChange} maxTags={2} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('adds a tag when a comma is typed', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('Введіть тег і натисніть Enter');

    fireEvent.change(input, { target: { value: 'interior,' } });

    expect(onTagsChange).toHaveBeenCalledWith(['interior']);
  });

  it('adds the current input value on blur', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('Введіть тег і натисніть Enter');

    fireEvent.change(input, { target: { value: 'exterior' } });
    fireEvent.blur(input);

    expect(onTagsChange).toHaveBeenCalledWith(['exterior']);
  });

  it('removes the last tag on Backspace when the input is empty', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={['a', 'b']} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('');

    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onTagsChange).toHaveBeenCalledWith(['a']);
  });

  it('removes a tag by clicking its remove button', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={['a', 'b']} onTagsChange={onTagsChange} />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(onTagsChange).toHaveBeenCalledWith(['b']);
  });

  it('ignores a tag that is only whitespace', () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByPlaceholderText('Введіть тег і натисніть Enter');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onTagsChange).not.toHaveBeenCalled();
  });
});
