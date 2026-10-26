import { describe, expect, it } from 'vitest';
import { isScrollType } from './scroll-type';

describe('isScrollType', () => {
  it('accepts both, horizontal and vertical', () => {
    expect(['both', 'horizontal', 'vertical'].map(isScrollType)).toEqual([true, true, true]);
  });

  it('rejects other strings and non-strings', () => {
    expect(isScrollType('x')).toBe(false);
    expect(isScrollType(1)).toBe(false);
  });
});
