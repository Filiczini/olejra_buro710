import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureTagsInput from '../FeatureTagsInput';

describe('FeatureTagsInput', () => {
  it('adds a feature on Enter and clears the input', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Додати особливість');

    fireEvent.change(input, { target: { value: 'Sea view' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Sea view']);
  });

  it('adds a feature when the + button is clicked', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={['existing']} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Додати особливість');

    fireEvent.change(input, { target: { value: 'New one' } });
    fireEvent.click(screen.getByRole('button', { name: '+' }));

    expect(onChange).toHaveBeenCalledWith(['existing', 'New one']);
  });

  it('adds a feature when a comma is typed, keeping the remainder in the input', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Додати особливість') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Pool,Gara' } });

    expect(onChange).toHaveBeenCalledWith(['Pool']);
    expect(input.value).toBe('Gara');
  });

  it('adds the current value on blur', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Додати особливість');

    fireEvent.change(input, { target: { value: 'Garden' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(['Garden']);
  });

  it('removes a feature by clicking its remove button', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={['a', 'b']} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole('button', { name: '×' })[0]);

    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('does not add an empty feature', () => {
    const onChange = vi.fn();
    render(<FeatureTagsInput features={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '+' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
