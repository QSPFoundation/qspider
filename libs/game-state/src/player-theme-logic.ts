// The pure choices behind player-theme.ts. Light: no DOM, no storage.
export type PlayerTheme = 'light' | 'dark';

/** A saved choice wins; the OS preference only applies when nothing valid is saved. */
export function choosePlayerTheme(stored: string | null, prefersDark: boolean): PlayerTheme {
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function otherPlayerTheme(theme: PlayerTheme): PlayerTheme {
  return theme === 'dark' ? 'light' : 'dark';
}
