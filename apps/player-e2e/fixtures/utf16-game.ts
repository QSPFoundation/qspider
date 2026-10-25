// The UTF-16 game (utf16-game/): a game.cfg stored as UTF-16 LE with a BOM, listing one style.
export const UTF16_GAME = {
  /** global-setup copies the folder (UTF-16 game.cfg included) under this name into the served build, for the URL routes. */
  servedDir: 'e2e-utf16',
  title: 'UTF-16 гра',
  text: { start: 'UTF16 START' },
  /** Set on :root by css/utf16.css; applied only if the game.cfg was decoded. */
  css: { property: '--e2e-utf16', value: 'UTF16' },
};
