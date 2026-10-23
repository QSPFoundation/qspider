import { describe, expect, it } from 'vitest';
import { isExternalUrl } from './path';

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
