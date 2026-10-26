import { describe, expect, it } from 'vitest';
import { choosePlayerTheme, otherPlayerTheme } from './player-theme-logic';

describe('choosePlayerTheme', () => {
  it('uses a saved choice over the OS preference', () => {
    expect(choosePlayerTheme('light', true)).toBe('light');
    expect(choosePlayerTheme('dark', false)).toBe('dark');
  });

  it('follows the OS preference when nothing is saved', () => {
    expect(choosePlayerTheme(null, true)).toBe('dark');
    expect(choosePlayerTheme(null, false)).toBe('light');
  });

  it('ignores a saved value that is not a theme', () => {
    expect(choosePlayerTheme('sepia', true)).toBe('dark');
    expect(choosePlayerTheme('', false)).toBe('light');
  });
});

describe('otherPlayerTheme', () => {
  it('swaps light and dark', () => {
    expect(otherPlayerTheme('light')).toBe('dark');
    expect(otherPlayerTheme('dark')).toBe('light');
  });
});
