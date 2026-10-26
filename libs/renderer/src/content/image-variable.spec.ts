import { describe, expect, it } from 'vitest';
import { imageVariable } from './image-variable';

describe('imageVariable', () => {
  it('wraps an image path in url()', () => {
    expect(imageVariable('images/sword.png')).toBe('url("images/sword.png")');
  });

  it('keeps an absolute address as written', () => {
    expect(imageVariable('https://example.com/a b.png')).toBe('url("https://example.com/a b.png")');
  });

  it('is empty for an item without an image', () => {
    expect(imageVariable('')).toBe('');
    expect(imageVariable(undefined)).toBe('');
  });
});
