import { describe, expect, it } from 'vitest';
import { fillFormat } from './fill-format';

describe('fillFormat', () => {
  it('puts the value in place of the placeholder', () => {
    expect(fillFormat('<b>%TEXT%</b>', { '%TEXT%': 'Go' })).toBe('<b>Go</b>');
  });

  it('leaves the format unchanged when the placeholder is missing', () => {
    expect(fillFormat('<b>x</b>', { '%TEXT%': 'Go' })).toBe('<b>x</b>');
  });

  it('replaces only the first occurrence of a placeholder', () => {
    expect(fillFormat('%TEXT% %TEXT%', { '%TEXT%': 'Go' })).toBe('Go %TEXT%');
  });

  it('fills the placeholders in the order of the keys', () => {
    expect(fillFormat('%TEXT%|%IMG%', { '%TEXT%': 'a', '%IMG%': 'b.png' })).toBe('a|b.png');
  });

  it('inserts a value with dollar patterns verbatim', () => {
    expect(fillFormat('<b>%TEXT%</b>', { '%TEXT%': 'Price: $$5 $& $1' })).toBe('<b>Price: $$5 $& $1</b>');
  });
});
