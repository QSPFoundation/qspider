import { atom } from 'xoid';
import { qspApi$ } from './qsp-engine';
import { releaseWatchStop, resetWatchBaseline, setWatchActive, snapshotAfterRun, snapshotAtStop } from './debug-watch';
import { placeStep, settleRun, type ActionRun, type StepPlace } from './action-run';
import { placeCodeLines } from './code-search';

export interface DebugRecord {
  code: string;
  loc: string;
  line: number;
  actIndex: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: number;
  event: string;
  args: unknown[];
}

export interface LocationInfo {
  name: string;
  code: string[];
  actions: string[][];
  actionNames: string[];
  description: string;
}

export interface DebugBreakpoint {
  id: string;
  location: string;
  line?: number;
  actionIndex?: number;
  enabled: boolean;
}

/** What the code viewer shows: a location, a current action, or the code a step runs outside both. */
export type CodeView = { kind: 'location' } | { kind: 'current-action'; index: number } | { kind: 'step-code' };

export interface DebugState {
  isEnabled: boolean;
  isPaused: boolean;
  currentRecord: DebugRecord | null;
  resumeFunction: (() => void) | null;
  locations: string[];
  selectedLocation: string | null;
  targetLine: number | null;
  breakpoints: DebugBreakpoint[];
  executionHistory: DebugRecord[];
  eventLog: EventLogEntry[];
  autoPauseOnLinks: boolean;
  /** The current action running now; null outside a run. */
  actionRun: ActionRun | null;
  /** Where the current step belongs. */
  stepPlace: StepPlace;
  codeView: CodeView;
}

export const debugState$ = atom<DebugState>({
  isEnabled: false,
  isPaused: false,
  currentRecord: null,
  resumeFunction: null,
  locations: [],
  selectedLocation: null,
  targetLine: null,
  breakpoints: [],
  executionHistory: [],
  eventLog: [],
  autoPauseOnLinks: false,
  actionRun: null,
  stepPlace: 'location',
  codeView: { kind: 'location' },
});

export const isDebugEnabled$ = debugState$.focus('isEnabled');
export const isDebugPaused$ = debugState$.focus('isPaused');
export const currentDebugRecord$ = debugState$.focus('currentRecord');
export const debugResumeFunction$ = debugState$.focus('resumeFunction');
export const canStep$ = debugState$.map((state) => Boolean(state.resumeFunction));
export const debugLocations$ = debugState$.focus('locations');
export const selectedDebugLocation$ = debugState$.focus('selectedLocation');
export const debugBreakpoints$ = debugState$.focus('breakpoints');
export const debugExecutionHistory$ = debugState$.focus('executionHistory');
export const eventLog$ = debugState$.focus('eventLog');
export const autoPauseOnLinks$ = debugState$.focus('autoPauseOnLinks');
export const debugActionRun$ = debugState$.focus('actionRun');
export const debugCodeView$ = debugState$.focus('codeView');

// Debugger UI state
export interface DebuggerUIState {
  isPanelOpen: boolean;
  dockPosition: 'bottom' | 'left' | 'right';
  size: { width: number; height: number };
}

const DEFAULT_PANEL_SIZE = { width: 600, height: 400 };

const DOCK_POSITIONS: readonly DebuggerUIState['dockPosition'][] = ['bottom', 'left', 'right'];

function parseSize(text: string | null): DebuggerUIState['size'] {
  if (!text) return { ...DEFAULT_PANEL_SIZE };
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const { width, height } = parsed as Record<string, unknown>;
      if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
        return { width, height };
      }
    }
  } catch {
    // fall through to the default
  }
  return { ...DEFAULT_PANEL_SIZE };
}

export function readDebuggerUiState(storage: Pick<Storage, 'getItem'> | null): DebuggerUIState {
  let savedPosition: string | null = null;
  let savedSize: string | null = null;
  try {
    if (storage) {
      savedPosition = storage.getItem('qsp-debugger-dock-position');
      savedSize = storage.getItem('qsp-debugger-size');
    }
  } catch {
    // unreadable storage means defaults
  }
  const dockPosition = DOCK_POSITIONS.find((p) => p === savedPosition) ?? 'bottom';
  return { isPanelOpen: false, dockPosition, size: parseSize(savedSize) };
}

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export const debuggerUIState$ = atom<DebuggerUIState>(() => readDebuggerUiState(getLocalStorage()));

export const isDebugPanelOpen$ = debuggerUIState$.focus('isPanelOpen');
export const debugDockPosition$ = debuggerUIState$.focus('dockPosition');
export const debugPanelSize$ = debuggerUIState$.focus('size');

export function persistDockPosition(storage: Pick<Storage, 'setItem'> | null, position: string): void {
  try {
    storage?.setItem('qsp-debugger-dock-position', position);
  } catch {
    // Ignore localStorage errors
  }
}

export function persistPanelSize(storage: Pick<Storage, 'setItem'> | null, size: DebuggerUIState['size']): void {
  try {
    storage?.setItem('qsp-debugger-size', JSON.stringify(size));
  } catch {
    // Ignore localStorage errors
  }
}

debugDockPosition$.subscribe((position) => persistDockPosition(getLocalStorage(), position));
debugPanelSize$.subscribe((size) => persistPanelSize(getLocalStorage(), size));

/**
 * Whether a step stops at a breakpoint. Without a line it stops anywhere in the location, its actions included.
 * With a line it stops at that line of its code: the action's code (`actionIndex`, a base action of the location,
 * as the step's `actIndex` counts) or else the location code (`actIndex` -1): action lines are numbered from 1
 * within the action, so the same number in the location code is another line.
 * A line without an action index is a line of the location code: it never matches a step placed elsewhere
 * (`place` other than 'location', the default).
 */
export function matchesBreakpoint(bp: DebugBreakpoint, record: DebugRecord, place: StepPlace = 'location'): boolean {
  if (!bp.enabled || bp.location !== record.loc) return false;
  if (bp.line !== undefined && bp.actionIndex === undefined && place !== 'location') return false;
  if (bp.line !== undefined && bp.line !== record.line) return false;
  if (bp.actionIndex !== undefined) return bp.actionIndex === record.actIndex;
  return bp.line === undefined || record.actIndex < 0;
}

/** Whether debug mode was on when the panel last closed: reopening turns it back on. */
let debugModeWasOn = false;

function setEngineDebugMode(on: boolean): void {
  const api = qspApi$.value;
  if (on) api?.enableDebugMode();
  else api?.disableDebugMode();
}

function locationLines(name: string): string[] {
  const api = qspApi$.value;
  return api ? placeCodeLines(api.getLocationCode(name)) : [];
}

function codeViewOf(place: StepPlace, run: ActionRun | null, current: CodeView): CodeView {
  if (place === 'action' && run) return { kind: 'current-action', index: run.index };
  if (place === 'code') return { kind: 'step-code' };
  return current;
}

function executeResume(): void {
  const resume = debugResumeFunction$.value;
  debugResumeFunction$.set(null);
  if (resume) {
    setTimeout(() => resume(), 0);
  }
}

export const debugActions = {
  getDebugState: (): DebugState => {
    return debugState$.value;
  },

  enableDebug: (): void => {
    isDebugEnabled$.set(true);
  },

  disableDebug: (): void => {
    debugModeWasOn = false;
    debugState$.update((state) => ({
      ...state,
      isEnabled: false,
      isPaused: false,
      currentRecord: null,
    }));
    executeResume();
  },

  pauseExecution: (): void => {
    isDebugPaused$.set(true);
  },

  resumeExecution: (): void => {
    isDebugPaused$.set(false);
    executeResume();
  },

  stepExecution: (): void => {
    executeResume();
  },

  setCurrentRecord: (record: DebugRecord, resume: () => void): void => {
    debugState$.update((state) => ({
      ...state,
      currentRecord: record,
      executionHistory: [...state.executionHistory.slice(-99), record],
    }));

    debugResumeFunction$.set(() => {
      releaseWatchStop();
      resume();
    });

    // While the panel is closed nothing pauses and nothing is read.
    if (!isDebugPanelOpen$.value) {
      executeResume();
      return;
    }
    const run = debugState$.value.actionRun;
    if (run && !run.origin) {
      const settled = settleRun(run, record, locationLines(record.loc));
      debugState$.update((s) => ({ ...s, actionRun: settled }));
    }
    const actionRun = debugState$.value.actionRun;
    const place = placeStep(record, actionRun);
    debugState$.update((s) => ({ ...s, stepPlace: place, codeView: codeViewOf(place, actionRun, s.codeView) }));

    const pauseOnChange = snapshotAtStop(record);
    const state = debugState$.value;
    const shouldPause = pauseOnChange || state.breakpoints.some((bp) => matchesBreakpoint(bp, record, place));

    if (shouldPause || state.isPaused) {
      debugState$.update((s) => ({ ...s, isPaused: true }));
    } else {
      executeResume();
    }
  },

  setLinkExecution: (code: string, execute: () => void): void => {
    if (!isDebugPanelOpen$.value) {
      execute();
      return;
    }
    const linkRecord: DebugRecord = {
      code,
      loc: '[EXEC Link]',
      line: 0,
      actIndex: -1,
    };

    debugState$.update((state) => ({
      ...state,
      currentRecord: linkRecord,
      executionHistory: [...state.executionHistory.slice(-99), linkRecord],
      isPaused: true,
    }));

    debugResumeFunction$.set(() => {
      debugState$.update((s) => ({ ...s, currentRecord: null }));
      execute();
      // After link execution, stay paused so QSP code triggered by the link also pauses
      // User will need to resume/step again to continue
    });
  },

  setLocations: (locations: string[]): void => {
    debugState$.update((state) => ({ ...state, locations }));
  },

  selectLocation: (location: string | null): void => {
    debugState$.update((state) => ({
      ...state,
      selectedLocation: location,
      targetLine: null,
      codeView: { kind: 'location' },
    }));
  },

  selectLocationWithLine: (location: string, line: number | null): void => {
    debugState$.update((state) => ({
      ...state,
      selectedLocation: location,
      targetLine: line,
      codeView: { kind: 'location' },
    }));
  },

  /** Shows a current action's code in the code viewer. */
  selectCurrentAction: (index: number): void => {
    debugState$.update((state) => ({ ...state, codeView: { kind: 'current-action', index } }));
  },

  /** Starts following a current action; only while the panel is open and debug mode is on. */
  beginActionRun: (index: number, name: string, lines: string[]): void => {
    if (!isDebugPanelOpen$.value || !debugState$.value.isEnabled) return;
    debugState$.update((state) => ({ ...state, actionRun: { index, name, lines, loc: null, origin: null } }));
  },

  endActionRun: (): void => {
    debugState$.update((state) => ({ ...state, actionRun: null, stepPlace: 'location' }));
  },

  addBreakpoint: (breakpoint: Omit<DebugBreakpoint, 'id'>): void => {
    const id = `bp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    debugState$.update((state) => ({
      ...state,
      breakpoints: [...state.breakpoints, { ...breakpoint, id }],
    }));
  },

  removeBreakpoint: (id: string): void => {
    debugState$.update((state) => ({
      ...state,
      breakpoints: state.breakpoints.filter((bp) => bp.id !== id),
    }));
  },

  toggleBreakpoint: (id: string): void => {
    debugState$.update((state) => ({
      ...state,
      breakpoints: state.breakpoints.map((bp) => (bp.id === id ? { ...bp, enabled: !bp.enabled } : bp)),
    }));
  },

  clearExecutionHistory: (): void => {
    debugState$.update((state) => ({ ...state, executionHistory: [] }));
  },

  logEvent: (event: string, ...args: unknown[]): void => {
    // Filter out functions completely and handle non-serializable objects
    const sanitizedArgs = args.filter((arg) => typeof arg !== 'function');

    const entry: EventLogEntry = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      event,
      args: sanitizedArgs,
    };
    debugState$.update((state) => ({
      ...state,
      eventLog: [...state.eventLog.slice(-199), entry], // Keep last 200 events
    }));
  },

  clearEventLog: (): void => {
    debugState$.update((state) => ({ ...state, eventLog: [] }));
  },

  clearAllBreakpoints: (): void => {
    debugState$.update((state) => ({ ...state, breakpoints: [] }));
  },

  toggleAutoPauseOnLinks: (): void => {
    debugState$.update((state) => ({ ...state, autoPauseOnLinks: !state.autoPauseOnLinks }));
  },

  // UI actions
  /** Opens the panel: debug mode comes back on if it was on when the panel closed, and watching starts afresh. */
  openDebugPanel: (): void => {
    if (isDebugPanelOpen$.value) return;
    isDebugPanelOpen$.set(true);
    if (debugModeWasOn) {
      setEngineDebugMode(true);
      debugActions.enableDebug();
    }
    setWatchActive(true);
    resetWatchBaseline();
    snapshotAfterRun();
  },

  /**
   * Closes the panel: a held pause (a debug stop or a held link) is released once, debug mode goes off (remembered
   * for reopening), and watching stops, so a closed panel neither pauses nor slows the game.
   */
  closeDebugPanel: (): void => {
    if (!isDebugPanelOpen$.value) return;
    const wasOn = debugState$.value.isEnabled;
    setWatchActive(false);
    isDebugPanelOpen$.set(false);
    setEngineDebugMode(false);
    debugActions.disableDebug(); // clears the pause and calls the held resume once
    debugModeWasOn = wasOn;
  },

  toggleDebugPanel: (): void => {
    if (isDebugPanelOpen$.value) debugActions.closeDebugPanel();
    else debugActions.openDebugPanel();
  },

  setDockPosition: (position: 'bottom' | 'left' | 'right'): void => {
    debugDockPosition$.set(position);
  },

  setPanelSize: (size: { width: number; height: number }): void => {
    debugPanelSize$.set(size);
  },
};
