import { afterEach, describe, expect, it } from 'vitest';
import { initialBaseUrl$, playerUrl } from './init';

describe('playerUrl', () => {
  afterEach(() => {
    initialBaseUrl$.set('/');
  });

  it('returns the base url when the query is empty', () => {
    initialBaseUrl$.set('https://player.test/app/');
    expect(playerUrl('')).toBe('https://player.test/app/');
    expect(playerUrl('?')).toBe('https://player.test/app/');
    expect(playerUrl(new URLSearchParams())).toBe('https://player.test/app/');
  });

  it('appends the query to the base url, dropping a leading ?', () => {
    initialBaseUrl$.set('https://player.test/app/');
    expect(playerUrl('?game=a')).toBe('https://player.test/app/?game=a');
    expect(playerUrl('game=a')).toBe('https://player.test/app/?game=a');
    expect(playerUrl(new URLSearchParams({ game: 'a b' }))).toBe('https://player.test/app/?game=a+b');
  });
});
