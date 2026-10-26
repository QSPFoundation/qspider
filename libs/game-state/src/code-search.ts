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
  getLocationActions(name: string): unknown[];
  getActionCode(name: string, index: number): string[];
  getLocationDescription(name: string): string;
}

export function buildLocationInfo(name: string, reader: LocationReader): LocationInfo {
  const code = reader.getLocationCode(name);
  const actionsList = reader.getLocationActions(name);
  const description = reader.getLocationDescription(name);
  const actions = actionsList.map((_, index) => reader.getActionCode(name, index));
  return { name, code, actions, description };
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
