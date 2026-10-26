// The decisions runGame and onGameCommand (current-game.ts) make from a game's descriptor and config files,
// kept apart from the fetching and the player's state. Light: types and the built-in theme names only.
import type { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { AERO_THEME, CLASSIC_THEME } from './theme-registry';

type GameWindow = GameDescriptor['window'];

export const DEFAULT_AERO_SIZE = { width: 800, height: 600 };

/** The mode of the running game; `classic` when there is no game or it names none. */
export function gameMode(game: GameDescriptor | null | undefined): string {
  return game?.mode || 'classic';
}
export function aeroWidth(game: GameDescriptor | null | undefined): number {
  return game?.aero?.width ?? DEFAULT_AERO_SIZE.width;
}
export function aeroHeight(game: GameDescriptor | null | undefined): number {
  return game?.aero?.height ?? DEFAULT_AERO_SIZE.height;
}
/** How many save slots the game offers (9 unless it says). */
export function slotCount(game: GameDescriptor | null | undefined): number {
  return game?.save_slots ?? 9;
}

/** The game's own entry of a `game.cfg`: its only game, else the one with `id`; undefined when none matches. */
export function pickDescriptor(config: PlayerConfig, id: string): GameDescriptor | undefined {
  if (config.game?.length === 1) return config.game[0];
  return config.game?.find((game) => game.id === id);
}

/** The window of an aero game: the given size, not resizable, over what its `game.cfg` window already said. */
export function aeroWindow(window: GameWindow, size: { width: number; height: number }): NonNullable<GameWindow> {
  return { ...(window ?? {}), ...size, resizable: false };
}

/** The size the `<game>` element of an aero game's `config.xml` asks for; null when there is no such element. */
export function configXmlSize(doc: Document): { width: number; height: number } | null {
  const gameElement = doc.querySelector('game');
  if (!gameElement) return null;
  return {
    width: parseInt(gameElement.getAttribute('width') || '800'),
    height: parseInt(gameElement.getAttribute('height') || '600'),
  };
}

/** The theme a game starts in: its `defaultTheme` when registered (else `missing` names it), else its mode's own. */
export function chooseTheme(
  game: Pick<GameDescriptor, 'mode' | 'defaultTheme'>,
  isRegistered: (alias: string) => boolean,
): { theme: string; missing?: string } {
  const modeTheme = game.mode === 'aero' ? AERO_THEME : CLASSIC_THEME;
  if (!game.defaultTheme) return { theme: modeTheme };
  if (isRegistered(game.defaultTheme)) return { theme: game.defaultTheme };
  return { theme: modeTheme, missing: game.defaultTheme };
}

export interface WindowSettingsPlan {
  /** Resize to this first (and wait for it). */
  size: { width: number; height: number } | null;
  resizable: boolean;
  /** Only for a resizable window. */
  minSize: { width: number; height: number } | null;
  maxSize: { width: number; height: number } | null;
  fullscreen: boolean;
}

/** What to do to the app window for a game's `window` settings; null when the game has none. */
export function windowSettingsPlan(window: GameWindow): WindowSettingsPlan | null {
  if (!window) return null;
  const resizable = window.resizable ?? true;
  return {
    size: window.width && window.height ? { width: window.width, height: window.height } : null,
    resizable,
    minSize:
      resizable && window.minWidth && window.minHeight ? { width: window.minWidth, height: window.minHeight } : null,
    maxSize:
      resizable && window.maxWidth && window.maxHeight ? { width: window.maxWidth, height: window.maxHeight } : null,
    fullscreen: Boolean(window.fullscreen),
  };
}

export type ParsedGameCommand =
  | { type: 'pause'; panel: string }
  | { type: 'scroll'; panel: string; direction: string | undefined }
  | { type: 'other' };

/** `pause:<panel>` and `scroll:<panel>:<direction>` are commands with arguments; everything else is a plain name. */
export function parseGameCommand(action: string): ParsedGameCommand {
  if (action.startsWith('pause:')) {
    const [, panel] = action.split(':');
    return { type: 'pause', panel };
  }
  if (action.startsWith('scroll:')) {
    const [, panel, direction] = action.split(':');
    return { type: 'scroll', panel, direction };
  }
  return { type: 'other' };
}
