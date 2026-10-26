import { create } from 'xoid';

import { choosePlayerTheme, otherPlayerTheme, type PlayerTheme } from './player-theme-logic';
export const playerTheme$ = create<PlayerTheme>('light');
/** e2e hook: the body has no other stable marker, so it carries the current theme. */
function markTheme(theme: PlayerTheme): void {
  document.body.setAttribute('data-qa', 'player-body');
  document.body.setAttribute('data-player-theme', theme);
}
export function initTheme(): void {
  const stored = localStorage.getItem('qspider-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const saved = choosePlayerTheme(stored, Boolean(prefersDark));
  playerTheme$.set(saved);
  markTheme(saved); // set() to the unchanged value does not notify the subscriber
}
export function toggleTheme(): void {
  playerTheme$.update(otherPlayerTheme);
  // Saved only here: until the player picks a theme, every launch follows the OS preference.
  localStorage.setItem('qspider-theme', playerTheme$.value);
}

playerTheme$.subscribe((theme) => {
  markTheme(theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
});
