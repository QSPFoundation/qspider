import { describe, expect, it } from 'vitest';
import { closesByGoingBack, pauseCloseUrl, pauseOpenUrl } from './pause-screen-url';

describe('pauseOpenUrl', () => {
  it('adds pause=true to an empty query', () => {
    expect(pauseOpenUrl('')).toBe('/?pause=true');
  });

  it('keeps the other parameters, as the location writes them with their ?', () => {
    expect(pauseOpenUrl('?game=abc&lang=ru')).toBe('/?game=abc&lang=ru&pause=true');
  });

  it('sets pause once when it is already there', () => {
    expect(pauseOpenUrl('?pause=false&game=abc')).toBe('/?pause=true&game=abc');
  });
});

describe('pauseCloseUrl', () => {
  it('takes pause out and keeps the rest', () => {
    expect(pauseCloseUrl('?game=abc&pause=true')).toBe('/?game=abc');
  });

  it('is the bare player URL when pause was the only parameter', () => {
    expect(pauseCloseUrl('?pause=true')).toBe('/');
    expect(pauseCloseUrl('')).toBe('/');
  });
});

describe('closesByGoingBack', () => {
  it('goes back when there is an entry to go back to', () => {
    expect(closesByGoingBack(2)).toBe(true);
  });

  it('replaces the URL when the pause screen is the only entry', () => {
    expect(closesByGoingBack(1)).toBe(false);
  });
});
