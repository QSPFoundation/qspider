import { describe, expect, it } from 'vitest';
import { pickTransformers } from './pick-transformers';

const sets: Record<'base' | 'classic' | 'aero', Record<string, number>> = {
  base: { a: 1, x: 1 },
  classic: { b: 2, x: 2 },
  aero: { c: 3, x: 3 },
};

describe('pickTransformers', () => {
  it('stacks base, classic and aero for aero, later sets winning', () => {
    expect(pickTransformers('aero', sets)).toEqual({ a: 1, b: 2, c: 3, x: 3 });
  });

  it('stacks base and classic for classic', () => {
    expect(pickTransformers('classic', sets)).toEqual({ a: 1, b: 2, x: 2 });
  });

  it('gives base for qspider and for an unknown mode', () => {
    expect(pickTransformers('qspider', sets)).toBe(sets.base);
    expect(pickTransformers('weird', sets)).toBe(sets.base);
  });
});
