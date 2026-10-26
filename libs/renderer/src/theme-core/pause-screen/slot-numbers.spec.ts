import { describe, expect, it } from 'vitest';
import { slotNumbers } from './slot-numbers';

describe('slotNumbers', () => {
  it('numbers the slots from 1', () => {
    expect(slotNumbers(5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('has no slots for a count of 0', () => {
    expect(slotNumbers(0)).toEqual([]);
  });
});
