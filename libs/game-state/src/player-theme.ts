import { create } from 'xoid';

type PlayerTheme = 'light' | 'dark';
export const playerTheme$ = create<PlayerTheme>('light');
/** e2e hook: the body has no other stable marker, so it carries the current theme. */
function markTheme(theme: PlayerTheme): void {
  document.body.setAttribute('data-qa', 'player-body');
  document.body.setAttribute('data-player-theme', theme);
}
export function initTheme(): void {
  const stored = localStorage.getItem('qspider-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  // A saved choice wins; the OS preference only applies when nothing is saved.
  const saved: PlayerTheme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
  playerTheme$.set(saved);
  markTheme(saved); // set() to the unchanged value does not notify the subscriber
}
export function toggleTheme(): void {
  playerTheme$.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
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
