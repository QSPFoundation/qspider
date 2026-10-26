import { describe, expect, it } from 'vitest';
import { imgSrc } from './img-src';

describe('imgSrc', () => {
  it('turns backslashes in a game path into slashes', () => {
    expect(imgSrc('pic\\hero\\a.png')).toBe('pic/hero/a.png');
  });

  it('keeps an external URL as written', () => {
    expect(imgSrc('https://example.com/a\\b.png')).toBe('https://example.com/a\\b.png');
  });

  it('keeps a data: picture as written', () => {
    expect(imgSrc('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('treats a Windows drive path as a game path', () => {
    expect(imgSrc('C:\\img\\a.png')).toBe('C:/img/a.png');
  });
});
