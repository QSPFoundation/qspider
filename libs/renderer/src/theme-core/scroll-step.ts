/** The main pane's next scroll step: a new location resets to -1, otherwise the step counts up from 0. */
export function mainScrollStep(isNewLoc: boolean, step: number): number {
  return isNewLoc ? -1 : Math.max(step, 0) + 1;
}

/** The stats pane's next scroll step: text appended to the previous stats counts up, anything else resets to -1. */
export function statsScrollStep(prevStats: string | undefined, stats: string, step: number): number {
  const isAppended = Boolean(prevStats) && stats !== prevStats && stats.startsWith(prevStats as string);
  return isAppended ? Math.max(step, 0) + 1 : -1;
}
