import { describe, expect, it } from 'vitest';
import { contentTypeOf, isUtf16Le, parseQspiderFileUrl } from './qspider-files';

describe('parseQspiderFileUrl', () => {
  it('decodes the game id and the path, and drops the query and the hash', () => {
    expect(parseQspiderFileUrl('https://x.org/qspider-files/g%201/img/a%20b.png?v=2#h')).toEqual({
      gameId: 'g 1',
      path: 'img/a b.png',
    });
  });

  it('finds the files below a base path', () => {
    expect(parseQspiderFileUrl('https://x.org/app/qspider-files/g/a.png')).toEqual({ gameId: 'g', path: 'a.png' });
  });

  it('matches the marker in any letter case', () => {
    expect(parseQspiderFileUrl('https://x.org/Qspider-Files/g/a.png')).toEqual({ gameId: 'g', path: 'a.png' });
  });

  it('returns null for a url that is not a qspider file', () => {
    expect(parseQspiderFileUrl('https://x.org/assets/a.png')).toBeNull();
  });
});

describe('contentTypeOf', () => {
  it('knows an extension in any letter case', () => {
    expect(contentTypeOf('a/b.PNG')).toBe('image/png');
  });

  it('reads the extension of a backslash path', () => {
    expect(contentTypeOf('IMG\\A.PNG')).toBe('image/png');
  });

  it('ignores a dot in a directory name', () => {
    expect(contentTypeOf('dir.v2/file')).toBeUndefined();
  });

  it('gives none to a file without an extension', () => {
    expect(contentTypeOf('noext')).toBeUndefined();
  });

  it('gives none to an unknown extension', () => {
    expect(contentTypeOf('a.unknown')).toBeUndefined();
  });
});

describe('isUtf16Le', () => {
  const bufferOf = (...bytes: number[]): ArrayBuffer => new Uint8Array(bytes).buffer;

  it('detects the UTF-16LE byte order mark', () => {
    expect(isUtf16Le(bufferOf(0xff, 0xfe, 0x3c, 0x00))).toBe(true);
  });

  it('rejects UTF-8 text with its byte order mark', () => {
    expect(isUtf16Le(bufferOf(0xef, 0xbb, 0xbf, 0x3c))).toBe(false);
  });

  it('rejects the UTF-16BE byte order mark', () => {
    expect(isUtf16Le(bufferOf(0xfe, 0xff))).toBe(false);
  });

  it('rejects buffers shorter than the mark', () => {
    expect(isUtf16Le(bufferOf())).toBe(false);
    expect(isUtf16Le(bufferOf(0xff))).toBe(false);
  });
});
