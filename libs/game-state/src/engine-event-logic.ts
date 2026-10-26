// The decisions behind the engine's callbacks in qsp-api.ts (links, version, files, new locations, panels,
// saves), kept apart from the engine wiring. Light: only types and the QspPanel enum (no side effects).
// A runtime import is safe only because the engine's entry has no side effects at import; only the enum is used.
import { QspPanel } from '@qsp/wasm-engine';
import type { DebugState } from './debug';

/** Whether a link the player runs goes through the debugger first: debugging, and paused or pausing on links. */
export function shouldPauseOnLink(
  debugState: Pick<DebugState, 'isEnabled' | 'isPaused' | 'autoPauseOnLinks'>,
): boolean {
  return debugState.isEnabled && (debugState.isPaused || debugState.autoPauseOnLinks);
}

/** A link whose href is QSP code (`exec:<code>`, the prefix in any case). */
export function isExecHref(href: string): boolean {
  return href.toLowerCase().startsWith('exec:');
}

/** The QSP code of an `exec:` href. */
export function stripExec(href: string): string {
  return href.substring(5);
}

/**
 * The answer to the engine's `version` question for `type`: `player` and `platform` are the player's; any
 * other type gets undefined, which means "the engine's own version".
 */
export function versionAnswer(type: string, env: { isBrowser: boolean; platform?: string }): string | undefined {
  switch (type) {
    case 'player':
      return 'qSpider';
    case 'platform':
      return env.isBrowser ? 'browser' : env.platform || 'unknown';
  }
  return undefined;
}

/** A game file in the text format (`.qsps`, any case), which must be converted before the engine opens it. */
export function isQspsFile(file: string): boolean {
  return file.toLowerCase().endsWith('.qsps');
}

/** The directory part of a path with its trailing `/`; '' for a bare file name. */
export function directoryOf(path: string): string {
  return path.slice(0, path.lastIndexOf('/') + 1);
}

/**
 * The base URL a game opened from `file` (a path relative to `baseUrl`, slashes already cleaned) reads its
 * files from: the directory `file` was fetched from, joined the way the fetch joins it (`baseUrl + file`).
 */
export function gameFileUrl(baseUrl: string, file: string): string {
  return baseUrl + directoryOf(file);
}

/**
 * Whether new main text starts a new location (so the new-location effect plays) rather than adding to the
 * current one: the first text, or text that neither repeats nor continues the current text.
 */
export function isNewLoc(prev: string, next: string): boolean {
  return !prev || (next !== prev && !next.startsWith(prev));
}

export interface NewLocEffect {
  effect: string;
  time: number;
  seq: boolean;
}

/** The new-location effect from the game's `$NEWLOC_EFFECT`, `NEWLOC_EFFECT_TIME` (default 500) and `NEWLOC_EFFECT_SEQ`. */
export function newLocEffect(readVariable: (name: string) => unknown): NewLocEffect {
  return {
    effect: String(readVariable('$NEWLOC_EFFECT') || ''),
    time: Number(readVariable('NEWLOC_EFFECT_TIME')) || 500,
    seq: Boolean(Number(readVariable('NEWLOC_EFFECT_SEQ'))),
  };
}

export interface PanelVisibility {
  stats: boolean;
  acts: boolean;
  objs: boolean;
  cmd: boolean;
}

/** Which of the player's panels a `panel_visibility` bitmask names (MAIN and VIEW are not shown or hidden this way). */
export function panelVisibility(type: number): PanelVisibility {
  return {
    stats: Boolean(type & QspPanel.VARS),
    acts: Boolean(type & QspPanel.ACTS),
    objs: Boolean(type & QspPanel.OBJS),
    cmd: Boolean(type & QspPanel.INPUT),
  };
}

/**
 * Where a game's SAVEGAME / OPENGAME (`save_game` / `load_save`) goes: with no game running the engine is
 * answered at once; a path is saved to or loaded from directly; no path asks the player in the saves panel.
 */
export function saveTarget(hasGame: boolean, path: string | undefined): 'answer-now' | 'path' | 'ask-player' {
  if (!hasGame) return 'answer-now';
  return path ? 'path' : 'ask-player';
}

/**
 * The value a watched game variable shows: QSP has no "unset", so 0 and `''` (what the engine reports for a
 * variable never assigned) mean "not set" and give the fallback; any other value is the game's.
 */
export function variableOrDefault<T>(value: T, fallback: T): T {
  return value || fallback;
}
