import { describe, expect, it } from 'vitest';
import { cleanPath, isExternalUrl } from './path';

describe('cleanPath', () => {
  it('turns backslashes into forward slashes', () => {
    expect(cleanPath('img\\sub\\A.PNG')).toBe('img/sub/A.PNG');
  });

  it('leaves forward-slash paths untouched', () => {
    expect(cleanPath('img/a.png')).toBe('img/a.png');
  });
});

describe('isExternalUrl', () => {
  it.each([
    'http://x',
    'https://x/a.png',
    'HTTP://x',
    'data:image/png;base64,AAAA',
    'blob:x',
    'qspider:x',
    'git+ssh:x',
  ])('treats %s as external', (url) => {
    expect(isExternalUrl(url)).toBe(true);
  });

  it.each(['C:\\x', 'c:/x', 'img/a.png', 'img\\a.png', '/abs/a.png', 'a:b/c', '', '1http://x', 'dir/a:b'])(
    'treats %j as a game path',
    (path) => {
      expect(isExternalUrl(path)).toBe(false);
    },
  );
});
