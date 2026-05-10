import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate', () => {
  it('formats ISO string to Ukrainian locale date', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('15.03.2024');
  });

  it('formats Date object to Ukrainian locale date', () => {
    const result = formatDate(new Date('2024-03-15'));
    expect(result).toBe('15.03.2024');
  });

  it('handles timestamps with time component', () => {
    const result = formatDate('2024-03-15T10:30:00.000Z');
    expect(result).toBe('15.03.2024');
  });
});
