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

export const debuggerUIState$ = atom<DebuggerUIState>(() => {
  // Initialize from localStorage
  try {
    const savedPosition = localStorage.getItem('qsp-debugger-dock-position');
    const savedSize = localStorage.getItem('qsp-debugger-size');
    return {
      isPanelOpen: false,
      dockPosition: (savedPosition as 'bottom' | 'left' | 'right') || 'bottom',
      size: savedSize ? JSON.parse(savedSize) : { width: 600, height: 400 },
    };
  } catch {
    return {
      isPanelOpen: false,
      dockPosition: 'bottom',
      size: { width: 600, height: 400 },
    };
  }
});

export const isDebugPanelOpen$ = debuggerUIState$.focus('isPanelOpen');
export const debugDockPosition$ = debuggerUIState$.focus('dockPosition');
export const debugPanelSize$ = debuggerUIState$.focus('size');

// Persist dock position to localStorage
debugDockPosition$.subscribe((position) => {
  try {
    localStorage.setItem('qsp-debugger-dock-position', position);
  } catch {
    // Ignore localStorage errors
  }
});

// Persist panel size to localStorage
debugPanelSize$.subscribe((size) => {
  try {
    localStorage.setItem('qsp-debugger-size', JSON.stringify(size));
  } catch {
    // Ignore localStorage errors
  }
});

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
    const shouldPause = state.breakpoints.some(
      (bp) =>
        bp.enabled &&
        bp.location === record.loc &&
        (bp.line === undefined || bp.line === record.line) &&
        (bp.actionIndex === undefined || bp.actionIndex === record.actIndex),
    );

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
