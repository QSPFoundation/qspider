import { create } from 'xoid';

type PlayerTheme = 'light' | 'dark';
export const playerTheme$ = create<PlayerTheme>('light');
/** e2e hook: the body has no other stable marker, so it carries the current theme. */
function markTheme(theme: PlayerTheme): void {
  document.body.setAttribute('data-qa', 'player-body');
  document.body.setAttribute('data-player-theme', theme);
}
export function initTheme(): void {
  let saved: PlayerTheme | null = localStorage.getItem('qspider-theme') as PlayerTheme;
  if (!saved && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    saved = 'dark';
  } else {
    saved = 'light';
  }
  playerTheme$.set(saved);
  markTheme(saved); // set() to the unchanged value does not notify the subscriber
}
export function toggleTheme(): void {
  playerTheme$.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
}

playerTheme$.subscribe((theme) => {
  markTheme(theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  localStorage.setItem('qspider-theme', theme);
});
