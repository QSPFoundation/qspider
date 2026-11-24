// What a click in the editor's glyph margin does to the breakpoints it shows (libs/debugger code-viewer.tsx
// handleBreakpointToggle): a line without one gets an enabled breakpoint; a line with one has it switched between
// enabled and disabled. Pure, so it is unit tested; tasks.ts reads the editor and clicks.

/** The line numbers with an enabled and with a disabled breakpoint. */
export interface LineBreakpoints {
  enabled: number[];
  disabled: number[];
}

const sorted = (lines: number[]): number[] => [...new Set(lines)].sort((a, b) => a - b);

/** The breakpoints after a glyph margin click on `line`. */
export function breakpointsAfterToggle(before: LineBreakpoints, line: number): LineBreakpoints {
  const others = (lines: number[]) => lines.filter((l) => l !== line);
  if (before.enabled.includes(line)) {
    return { enabled: sorted(others(before.enabled)), disabled: sorted([...before.disabled, line]) };
  }
  return { enabled: sorted([...before.enabled, line]), disabled: sorted(others(before.disabled)) };
}

/** `enabled 1, 3; disabled 5` (or `none`): one string, so a wait can compare and report it. */
export function describeBreakpoints({ enabled, disabled }: LineBreakpoints): string {
  const parts = [];
  if (enabled.length) parts.push(`enabled ${sorted(enabled).join(', ')}`);
  if (disabled.length) parts.push(`disabled ${sorted(disabled).join(', ')}`);
  return parts.length ? parts.join('; ') : 'none';
}
