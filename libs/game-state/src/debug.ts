import { atom } from 'xoid';

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
  description: string;
}

export interface DebugBreakpoint {
  id: string;
  location: string;
  line?: number;
  actionIndex?: number;
  enabled: boolean;
}

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

export function matchesBreakpoint(bp: DebugBreakpoint, record: DebugRecord): boolean {
  return (
    bp.enabled &&
    bp.location === record.loc &&
    (bp.line === undefined || bp.line === record.line) &&
    (bp.actionIndex === undefined || bp.actionIndex === record.actIndex)
  );
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

    debugResumeFunction$.set(resume);

    const state = debugState$.value;
    const shouldPause = state.breakpoints.some((bp) => matchesBreakpoint(bp, record));

    if (shouldPause || state.isPaused) {
      debugState$.update((s) => ({ ...s, isPaused: true }));
    } else {
      executeResume();
    }
  },

  setLinkExecution: (code: string, execute: () => void): void => {
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
    debugState$.update((state) => ({ ...state, selectedLocation: location, targetLine: null }));
  },

  selectLocationWithLine: (location: string, line: number | null): void => {
    debugState$.update((state) => ({ ...state, selectedLocation: location, targetLine: line }));
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
  openDebugPanel: (): void => {
    isDebugPanelOpen$.set(true);
  },

  closeDebugPanel: (): void => {
    isDebugPanelOpen$.set(false);
  },

  toggleDebugPanel: (): void => {
    isDebugPanelOpen$.update((isOpen) => !isOpen);
  },

  setDockPosition: (position: 'bottom' | 'left' | 'right'): void => {
    debugDockPosition$.set(position);
  },

  setPanelSize: (size: { width: number; height: number }): void => {
    debugPanelSize$.set(size);
  },
};
