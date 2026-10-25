import { describe, expect, it } from 'vitest';
import { cyrb53 } from './hash';

describe('cyrb53', () => {
  it('is deterministic', () => {
    expect(cyrb53('game')).toBe(cyrb53('game'));
  });

  it('returns a lowercase hex string', () => {
    expect(cyrb53('game')).toMatch(/^[0-9a-f]+$/);
  });

  it('changes the result with a seed', () => {
    expect(cyrb53('game', 1)).not.toBe(cyrb53('game'));
  });

  // Game ids derive from this hash: changing it would orphan saved games.
  it('keeps its published values', () => {
    expect(cyrb53('hello')).toBe('106f3a63cd7226');
    expect(cyrb53('hello', 1)).toBe('1897bfcd0b3443');
  });
});
