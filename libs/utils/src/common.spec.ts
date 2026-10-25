import { describe, expect, it } from 'vitest';
import { defer, hashString, prepareBaseUrl } from './common';

describe('defer', () => {
  it('resolves the promise with the given value', async () => {
    const deferred = defer<number>();
    deferred.resolve(1);
    await expect(deferred.promise).resolves.toBe(1);
  });

  it('rejects the promise with the given reason', async () => {
    const deferred = defer<number>();
    deferred.reject(new Error('x'));
    await expect(deferred.promise).rejects.toThrow('x');
  });
});

describe('hashString', () => {
  it('hashes the empty string to 0', () => {
    expect(hashString('')).toBe(0);
  });

  it('is deterministic', () => {
    expect(hashString('game.qsp')).toBe(hashString('game.qsp'));
  });

  it('gives different values for different strings', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(hashString('ab')).not.toBe(hashString('ba'));
  });
});

describe('prepareBaseUrl', () => {
  it('drops the file name, query and hash', () => {
    expect(prepareBaseUrl('https://a.org/games/x.qsp?v=1#h')).toBe('https://a.org/games/');
  });

  it('adds a trailing slash to a bare origin', () => {
    expect(prepareBaseUrl('https://a.org')).toBe('https://a.org/');
  });

  it('keeps a directory URL as it is', () => {
    expect(prepareBaseUrl('https://a.org/dir/')).toBe('https://a.org/dir/');
  });
});
