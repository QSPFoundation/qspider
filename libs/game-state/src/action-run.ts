import type { DebugRecord } from './debug';

/** Where an action's code came from: written in its location, or built elsewhere (by `dynamic`). */
export type ActionOrigin = 'placed' | 'detached';

/** Where a step of an action run belongs: the location code, the action's own code, or neither. */
export type StepPlace = 'location' | 'action' | 'code';

export interface ActionRun {
  /** Index in the current actions list when it started. */
  index: number;
  name: string;
  /** The action's code lines, saved at start. */
  lines: string[];
  /** `record.loc` of its first step; null until then. */
  loc: string | null;
  /** Null until the first step. */
  origin: ActionOrigin | null;
  /** The code lines of its location, read at the first step; null until then. */
  locationLines: string[] | null;
  /**
   * Whether a detached run entered its own location again (a `gt`/`xgt` there): from then on a step that is both a
   * location line and a saved action line is the location's. The engine reports no entry step for such a jump, so
   * the sign is the first step in the location that is a location line and no saved action line. Steps before it
   * stay the action's (a location whose first line runs is both); a `gs` there enters it too, and steps of the action
   * after the `gs` returns can't be told from the location's when their text and number match.
   */
  reentered: boolean;
}

export function codeLinesOf(code: string): string[] {
  return code.split(/\r?\n/);
}

/**
 * Whether an action line is the location line of the same number: the same text, or the code of an inline act
 * (`ACT 'x': PL 1` gives the action line ` PL 1`, as is). Containment alone would let a dynamic action's text that
 * a location line happens to hold (a string literal) pass for placed.
 */
function isPlacedLine(actionLine: string, locationLine: string): boolean {
  const text = actionLine.trim();
  if (text === '') return true;
  return locationLine.trim() === text || locationLine.trimEnd().endsWith(':' + actionLine);
}

/** Placed when every non-empty action line is the location line of the same number (see `isPlacedLine`). */
export function actionOrigin(actionLines: string[], locationLines: string[]): ActionOrigin {
  const placed = actionLines.every((line, i) => isPlacedLine(line, locationLines[i] ?? ''));
  return placed ? 'placed' : 'detached';
}

/**
 * Fixes the location, its lines and the origin of a run at its first step; a settled run is returned as is. A base
 * action (a step with an action index) is placed: its steps are numbered in its own code, not in a location's.
 */
export function settleRun(run: ActionRun, record: DebugRecord, locationLines: string[]): ActionRun {
  if (run.origin) return run;
  const origin = record.actIndex >= 0 ? 'placed' : actionOrigin(run.lines, locationLines);
  return { ...run, loc: record.loc, origin, locationLines };
}

/** Whether a step runs lines of the saved action code: its lines equal the saved ones from its line number on. */
export function isActionStep(record: DebugRecord, actionLines: string[]): boolean {
  if (record.line < 1) return false;
  const lines = codeLinesOf(record.code).map((line) => line.trim());
  const saved = actionLines.slice(record.line - 1, record.line - 1 + lines.length).map((line) => line.trim());
  return saved.length === lines.length && lines.every((line, i) => line === saved[i]);
}

/**
 * Whether a step runs lines of the location: the entry step (line 0), or each of its lines is contained in the
 * location line of the same number (a statement after an inline act's colon is part of its line).
 */
export function isLocationStep(record: DebugRecord, locationLines: string[]): boolean {
  if (record.line === 0) return true;
  if (record.line < 0) return false;
  return codeLinesOf(record.code).every((line, i) =>
    (locationLines[record.line - 1 + i] ?? '').trim().includes(line.trim()),
  );
}

/**
 * Where a step of the run belongs: in a detached run's location, its own code is the action, the location's lines
 * are the location, and anything else is code alone. A step that is both is the action's until the run enters the
 * location again, and the location's after.
 */
export function placeStep(record: DebugRecord, run: ActionRun | null): StepPlace {
  if (!run || run.origin !== 'detached' || record.actIndex >= 0 || record.loc !== run.loc) return 'location';
  const inLocation = isLocationStep(record, run.locationLines ?? []);
  if (run.reentered && inLocation) return 'location';
  if (isActionStep(record, run.lines)) return 'action';
  return inLocation ? 'location' : 'code';
}

/** Marks a settled detached run whose step shows it entered its own location again (see `ActionRun.reentered`). */
export function followRun(run: ActionRun, record: DebugRecord): ActionRun {
  if (run.origin !== 'detached' || run.reentered || record.actIndex >= 0 || record.loc !== run.loc) return run;
  const locationOnly = isLocationStep(record, run.locationLines ?? []) && !isActionStep(record, run.lines);
  return locationOnly ? { ...run, reentered: true } : run;
}
