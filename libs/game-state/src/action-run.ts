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
}

export function codeLinesOf(code: string): string[] {
  return code.split(/\r?\n/);
}

/** Placed when every non-empty action line is contained in the location line of the same number. */
export function actionOrigin(actionLines: string[], locationLines: string[]): ActionOrigin {
  const placed = actionLines.every((line, i) => {
    const text = line.trim();
    return text === '' || (locationLines[i] ?? '').includes(text);
  });
  return placed ? 'placed' : 'detached';
}

/** Fixes the location and origin of a run at its first step; a settled run is returned as is. */
export function settleRun(run: ActionRun, record: DebugRecord, locationLines: string[]): ActionRun {
  if (run.origin) return run;
  return { ...run, loc: record.loc, origin: actionOrigin(run.lines, locationLines) };
}

/** Whether a step runs lines of the saved action code: its lines equal the saved ones from its line number on. */
export function isActionStep(record: DebugRecord, actionLines: string[]): boolean {
  if (record.line < 1) return false;
  const lines = codeLinesOf(record.code).map((line) => line.trim());
  const saved = actionLines.slice(record.line - 1, record.line - 1 + lines.length).map((line) => line.trim());
  return saved.length === lines.length && lines.every((line, i) => line === saved[i]);
}

/** Where a step of the run belongs: only a detached run's own code is the action; its other steps are code. */
export function placeStep(record: DebugRecord, run: ActionRun | null): StepPlace {
  if (!run || run.origin !== 'detached' || record.actIndex >= 0 || record.loc !== run.loc) return 'location';
  return isActionStep(record, run.lines) ? 'action' : 'code';
}
