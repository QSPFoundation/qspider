import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  debugActions,
  debugState$,
  matchesBreakpoint,
  readDebuggerUiState,
  type DebugBreakpoint,
  type DebugRecord,
} from './debug';

const storageOf = (items: Record<string, string>) => ({
  getItem: (key: string) => (key in items ? items[key] : null),
});

const DEFAULT_UI = { isPanelOpen: false, dockPosition: 'bottom', size: { width: 600, height: 400 } };

const record = (over: Partial<DebugRecord> = {}): DebugRecord => ({
  code: 'x = 1',
  loc: 'start',
  line: 1,
  actIndex: -1,
  ...over,
});

const initialState = debugState$.value;

beforeEach(() => {
  debugState$.set(initialState);
});

describe('readDebuggerUiState', () => {
  it('returns the defaults without storage', () => {
    expect(readDebuggerUiState(null)).toEqual(DEFAULT_UI);
  });

  it('returns the defaults for empty storage', () => {
    expect(readDebuggerUiState(storageOf({}))).toEqual(DEFAULT_UI);
  });

  it('restores a saved dock position and size', () => {
    const storage = storageOf({
      'qsp-debugger-dock-position': 'right',
      'qsp-debugger-size': '{"width":300,"height":500}',
    });
    expect(readDebuggerUiState(storage)).toEqual({
      isPanelOpen: false,
      dockPosition: 'right',
      size: { width: 300, height: 500 },
    });
  });

  it('falls back to the defaults when storage throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
    };
    expect(readDebuggerUiState(storage)).toEqual(DEFAULT_UI);
  });

  it('falls back to the default size for the stored text "null" (D19)', () => {
    expect(readDebuggerUiState(storageOf({ 'qsp-debugger-size': 'null' })).size).toEqual({ width: 600, height: 400 });
  });

  it('falls back to the default size for unparsable text (D19)', () => {
    expect(readDebuggerUiState(storageOf({ 'qsp-debugger-size': 'abc' })).size).toEqual({ width: 600, height: 400 });
  });

  it('falls back to the default size when the numbers are missing (D19)', () => {
    expect(readDebuggerUiState(storageOf({ 'qsp-debugger-size': '{"width":"wide"}' })).size).toEqual({
      width: 600,
      height: 400,
    });
  });

  it('falls back to the bottom dock for an unknown dock string (D19)', () => {
    expect(readDebuggerUiState(storageOf({ 'qsp-debugger-dock-position': 'abc' })).dockPosition).toBe('bottom');
  });

  it('keeps a valid dock when the size is invalid (D19)', () => {
    const state = readDebuggerUiState(storageOf({ 'qsp-debugger-dock-position': 'left', 'qsp-debugger-size': 'null' }));
    expect(state.dockPosition).toBe('left');
  });
});

describe('matchesBreakpoint', () => {
  const bp = (over: Partial<DebugBreakpoint> = {}): DebugBreakpoint => ({
    id: 'bp-1',
    location: 'start',
    enabled: true,
    ...over,
  });

  it('matches a location-wide breakpoint on any line', () => {
    expect(matchesBreakpoint(bp(), record({ line: 7 }))).toBe(true);
  });

  it('does not match another location', () => {
    expect(matchesBreakpoint(bp(), record({ loc: 'other' }))).toBe(false);
  });

  it('does not match a disabled breakpoint', () => {
    expect(matchesBreakpoint(bp({ enabled: false }), record())).toBe(false);
  });

  it('requires the same line when the breakpoint has one', () => {
    expect(matchesBreakpoint(bp({ line: 3 }), record({ line: 3 }))).toBe(true);
    expect(matchesBreakpoint(bp({ line: 3 }), record({ line: 4 }))).toBe(false);
  });

  it('requires the same action index when the breakpoint has one', () => {
    expect(matchesBreakpoint(bp({ actionIndex: 0 }), record({ actIndex: 0 }))).toBe(true);
    expect(matchesBreakpoint(bp({ actionIndex: 0 }), record({ actIndex: 1 }))).toBe(false);
  });
});

describe('breakpoints', () => {
  it('adds a breakpoint with a generated id', () => {
    debugActions.addBreakpoint({ location: 'start', line: 2, enabled: true });
    const [added] = debugState$.value.breakpoints;
    expect(added).toMatchObject({ location: 'start', line: 2, enabled: true });
    expect(added.id).toMatch(/^bp-\d+-[a-z0-9]+$/);
  });

  it('removes a breakpoint by id', () => {
    debugActions.addBreakpoint({ location: 'a', enabled: true });
    debugActions.addBreakpoint({ location: 'b', enabled: true });
    const [a] = debugState$.value.breakpoints;
    debugActions.removeBreakpoint(a.id);
    expect(debugState$.value.breakpoints.map((b) => b.location)).toEqual(['b']);
  });

  it('toggles only the chosen breakpoint', () => {
    debugActions.addBreakpoint({ location: 'a', enabled: true });
    debugActions.addBreakpoint({ location: 'b', enabled: true });
    const [a] = debugState$.value.breakpoints;
    debugActions.toggleBreakpoint(a.id);
    expect(debugState$.value.breakpoints.map((b) => b.enabled)).toEqual([false, true]);
    debugActions.toggleBreakpoint(a.id);
    expect(debugState$.value.breakpoints.map((b) => b.enabled)).toEqual([true, true]);
  });

  it('clears every breakpoint', () => {
    debugActions.addBreakpoint({ location: 'a', enabled: true });
    debugActions.clearAllBreakpoints();
    expect(debugState$.value.breakpoints).toEqual([]);
  });
});

describe('records and history', () => {
  it('keeps only the last 100 history records', () => {
    debugState$.update((s) => ({ ...s, isPaused: true }));
    for (let i = 0; i < 105; i++) debugActions.setCurrentRecord(record({ line: i }), () => undefined);
    const history = debugState$.value.executionHistory;
    expect(history).toHaveLength(100);
    expect(history[0].line).toBe(5);
    expect(history[99].line).toBe(104);
  });

  it('pauses on a matching breakpoint and keeps the resume function', () => {
    debugActions.addBreakpoint({ location: 'start', line: 1, enabled: true });
    const resume = () => undefined;
    debugActions.setCurrentRecord(record(), resume);
    expect(debugState$.value.isPaused).toBe(true);
    expect(debugState$.value.resumeFunction).toBe(resume);
  });

  it('clears the execution history', () => {
    debugActions.setCurrentRecord(record(), () => undefined);
    debugActions.clearExecutionHistory();
    expect(debugState$.value.executionHistory).toEqual([]);
  });

  it('pauses on a link execution and runs it on resume', () => {
    vi.useFakeTimers();
    try {
      let ran = 0;
      debugActions.setLinkExecution('gt "x"', () => {
        ran++;
      });
      expect(debugState$.value.isPaused).toBe(true);
      expect(debugState$.value.currentRecord).toEqual({ code: 'gt "x"', loc: '[EXEC Link]', line: 0, actIndex: -1 });
      debugActions.stepExecution();
      vi.runAllTimers();
      expect(ran).toBe(1);
      expect(debugState$.value.currentRecord).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('execution control', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs the resume function on a later tick, once, and clears it', () => {
    let calls = 0;
    debugActions.setCurrentRecord(record(), () => {
      calls++;
    });
    // no breakpoint, not paused: setCurrentRecord resumed already
    expect(calls).toBe(0);
    expect(debugState$.value.resumeFunction).toBeNull();
    vi.runAllTimers();
    expect(calls).toBe(1);
  });

  it('stays paused until stepped, then resumes one record', () => {
    debugActions.pauseExecution();
    let calls = 0;
    debugActions.setCurrentRecord(record(), () => {
      calls++;
    });
    vi.runAllTimers();
    expect(calls).toBe(0);
    debugActions.stepExecution();
    vi.runAllTimers();
    expect(calls).toBe(1);
  });

  it('resumeExecution unpauses and runs the pending resume', () => {
    debugActions.pauseExecution();
    let calls = 0;
    debugActions.setCurrentRecord(record(), () => {
      calls++;
    });
    debugActions.resumeExecution();
    expect(debugState$.value.isPaused).toBe(false);
    vi.runAllTimers();
    expect(calls).toBe(1);
  });

  it('disableDebug unpauses, drops the record and releases the pending resume', () => {
    debugActions.enableDebug();
    debugActions.pauseExecution();
    let calls = 0;
    debugActions.setCurrentRecord(record(), () => {
      calls++;
    });
    debugActions.disableDebug();
    vi.runAllTimers();
    expect(debugState$.value).toMatchObject({ isEnabled: false, isPaused: false, currentRecord: null });
    expect(calls).toBe(1);
  });
});

describe('locations', () => {
  it('stores the location list', () => {
    debugActions.setLocations(['a', 'b']);
    expect(debugState$.value.locations).toEqual(['a', 'b']);
  });

  it('selectLocation resets the target line', () => {
    debugActions.selectLocationWithLine('a', 5);
    debugActions.selectLocation('b');
    expect(debugState$.value).toMatchObject({ selectedLocation: 'b', targetLine: null });
  });

  it('selectLocationWithLine sets both', () => {
    debugActions.selectLocationWithLine('a', 5);
    expect(debugState$.value).toMatchObject({ selectedLocation: 'a', targetLine: 5 });
  });
});

describe('event log', () => {
  it('drops function arguments and keeps the rest', () => {
    debugActions.logEvent('click', 1, () => undefined, 'x');
    expect(debugState$.value.eventLog[0].args).toEqual([1, 'x']);
    expect(debugState$.value.eventLog[0].event).toBe('click');
  });

  it('gives each entry an id and a timestamp', () => {
    debugActions.logEvent('e');
    const [entry] = debugState$.value.eventLog;
    expect(entry.id).toMatch(/^event-\d+-[a-z0-9]+$/);
    expect(typeof entry.timestamp).toBe('number');
  });

  it('keeps only the last 200 entries', () => {
    for (let i = 0; i < 205; i++) debugActions.logEvent(`e${i}`);
    const log = debugState$.value.eventLog;
    expect(log).toHaveLength(200);
    expect(log[0].event).toBe('e5');
    expect(log[199].event).toBe('e204');
  });

  it('clears the log', () => {
    debugActions.logEvent('e');
    debugActions.clearEventLog();
    expect(debugState$.value.eventLog).toEqual([]);
  });

  it('toggles auto-pause on links', () => {
    debugActions.toggleAutoPauseOnLinks();
    expect(debugState$.value.autoPauseOnLinks).toBe(true);
    debugActions.toggleAutoPauseOnLinks();
    expect(debugState$.value.autoPauseOnLinks).toBe(false);
  });
});
