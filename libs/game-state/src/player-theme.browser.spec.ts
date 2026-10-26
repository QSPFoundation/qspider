import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initTheme, playerTheme$, toggleTheme } from './player-theme';

// The module's own subscriber paints the body; these tests read the body and localStorage as the app does.
// The OS preference is decided in player-theme-logic.spec.ts; here a saved choice makes the result certain.
const KEY = 'qspider-theme';

beforeEach(() => {
  localStorage.removeItem(KEY);
  playerTheme$.set('light');
});
afterEach(() => {
  localStorage.removeItem(KEY);
});

describe('initTheme', () => {
  it('uses the saved light choice and paints the body light', () => {
    playerTheme$.set('dark');
    localStorage.setItem(KEY, 'light');
    initTheme();
    expect(playerTheme$.value).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('uses the saved dark choice', () => {
    localStorage.setItem(KEY, 'dark');
    initTheme();
    expect(playerTheme$.value).toBe('dark');
    expect(document.body.getAttribute('data-player-theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('marks the body with the e2e hook even when the theme did not change', () => {
    document.body.removeAttribute('data-qa');
    localStorage.setItem(KEY, 'light');
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
