import type { LocationInfo } from './debug';

export interface CodeInspectorState {
  locationInfoCache: Map<string, LocationInfo>;
  isLoading: boolean;
  error: string | null;
}

export const beginLoad = (state: CodeInspectorState): CodeInspectorState => ({
  ...state,
  isLoading: true,
  error: null,
});

export const endLoad = (state: CodeInspectorState): CodeInspectorState => ({ ...state, isLoading: false });

export const failLoad = (state: CodeInspectorState, error: unknown, fallback: string): CodeInspectorState => ({
  ...state,
  isLoading: false,
  error: errorMessage(error, fallback),
});

export const cacheLocation = (state: CodeInspectorState, name: string, info: LocationInfo): CodeInspectorState => ({
  ...state,
  locationInfoCache: new Map(state.locationInfoCache).set(name, info),
  isLoading: false,
});

export const emptyCache = (state: CodeInspectorState): CodeInspectorState => ({
  ...state,
  locationInfoCache: new Map(),
});

export type CodeMatch =
  | { kind: 'code'; line: number; text: string }
  | { kind: 'action'; actionIndex: number; actionLine: number; text: string };

export interface LocationMatches {
  location: string;
  matches: CodeMatch[];
}

export interface LocationReader {
  getLocationCode(name: string): string[];
  getLocationActions(name: string): Array<{ name: string }>;
  getActionCode(name: string, index: number): string[];
  getLocationDescription(name: string): string;
}

/**
 * Lays engine code entries out so that element `n - 1` is engine line `n`. An entry may span several lines
 * (line continuation, multi-line string or comment); gaps between entries are empty lines.
 */
export function placeCodeLines(entries: Array<{ line: number; code: string }>): string[] {
  const lines: string[] = [];
  for (const { line, code } of entries) {
    code.split(/\r?\n/).forEach((text, offset) => {
      const index = line - 1 + offset;
      while (lines.length < index) lines.push('');
      lines[index] = text;
    });
  }
  return lines;
}

export function buildLocationInfo(name: string, reader: LocationReader): LocationInfo {
  const code = reader.getLocationCode(name);
  const actionsList = reader.getLocationActions(name);
  const description = reader.getLocationDescription(name);
  const actions = actionsList.map((_, index) => reader.getActionCode(name, index));
  const actionNames = actionsList.map((action) => action.name);
  return { name, code, actions, actionNames, description };
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function searchLocations(cache: Map<string, LocationInfo>, searchTerm: string): LocationMatches[] {
  const results: LocationMatches[] = [];
  const needle = searchTerm.toLowerCase();
  if (!needle) return results;

  for (const [locationName, locationInfo] of cache) {
    const matches: CodeMatch[] = [];

    locationInfo.code.forEach((line, index) => {
      if (line.toLowerCase().includes(needle)) {
        matches.push({ kind: 'code', line: index + 1, text: line.trim() });
      }
    });

    locationInfo.actions.forEach((action, actionIndex) => {
      action.forEach((line, lineIndex) => {
        if (line.toLowerCase().includes(needle)) {
          matches.push({
            kind: 'action',
            actionIndex,
            actionLine: lineIndex + 1,
            text: `[Action ${actionIndex}] ${line.trim()}`,
          });
        }
      });
    });

    if (matches.length > 0) {
      results.push({ location: locationName, matches });
    }
  }

  return results;
}
