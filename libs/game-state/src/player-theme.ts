import { create } from 'xoid';

type PlayerTheme = 'light' | 'dark';
export const playerTheme$ = create<PlayerTheme>('light');
export function initTheme(): void {
  let saved: PlayerTheme | null = localStorage.getItem('qspider-theme') as PlayerTheme;
  if (!saved && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    saved = 'dark';
  } else {
    saved = 'light';
  }
  playerTheme$.set(saved);
}
export function toggleTheme(): void {
  playerTheme$.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
}

playerTheme$.subscribe((theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  localStorage.setItem('qspider-theme', theme);
});
