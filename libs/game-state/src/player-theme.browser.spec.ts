import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initTheme, playerTheme$, toggleTheme } from './player-theme';

// The module's own subscriber paints the body; these tests read the body and localStorage as the app does.
const KEY = 'qspider-theme';

function setPrefersDark(dark: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) =>
    ({ matches: dark && query.includes('dark'), media: query }) as MediaQueryList) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

let restore: () => void = () => undefined;
beforeEach(() => {
  localStorage.removeItem(KEY);
  playerTheme$.set('light');
  restore = setPrefersDark(false);
});
afterEach(() => {
  restore();
  localStorage.removeItem(KEY);
});

describe('initTheme', () => {
  it('uses the saved dark choice', () => {
    localStorage.setItem(KEY, 'dark');
    initTheme();
    expect(playerTheme$.value).toBe('dark');
    expect(document.body.getAttribute('data-player-theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('uses the saved light choice over an OS preference for dark', () => {
    restore();
    restore = setPrefersDark(true);
    localStorage.setItem(KEY, 'light');
    initTheme();
    expect(playerTheme$.value).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('follows the OS preference when nothing is saved', () => {
    restore();
    restore = setPrefersDark(true);
    initTheme();
    expect(playerTheme$.value).toBe('dark');
  });

  it('is light with no saved choice and no preference for dark', () => {
    initTheme();
    expect(playerTheme$.value).toBe('light');
  });

  it('ignores a saved value that is not a theme', () => {
    localStorage.setItem(KEY, 'sepia');
    initTheme();
    expect(playerTheme$.value).toBe('light');
  });

  it('marks the body with the e2e hook even when the theme did not change', () => {
    document.body.removeAttribute('data-qa');
    initTheme();
    expect(document.body.getAttribute('data-qa')).toBe('player-body');
    expect(document.body.getAttribute('data-player-theme')).toBe('light');
  });
});

describe('toggleTheme', () => {
  it('switches light to dark, saves it and paints the body', () => {
    toggleTheme();
    expect(playerTheme$.value).toBe('dark');
    expect(localStorage.getItem(KEY)).toBe('dark');
    expect(document.body.getAttribute('data-player-theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('switches back to light and removes the dark class', () => {
    toggleTheme();
    toggleTheme();
    expect(playerTheme$.value).toBe('light');
    expect(localStorage.getItem(KEY)).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });
});
