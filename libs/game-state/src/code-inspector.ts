import { atom } from 'xoid';
import {
  getLocationsList,
  getLocationCode,
  getLocationActions,
  getActionCode,
  getLocationDescription,
} from './qsp-api';
import { debugActions, LocationInfo } from './debug';

export interface CodeInspectorState {
  locationInfoCache: Map<string, LocationInfo>;
  isLoading: boolean;
  error: string | null;
}

export const codeInspectorState$ = atom<CodeInspectorState>({
  locationInfoCache: new Map(),
  isLoading: false,
  error: null,
});

export const codeInspectorActions = {
  refreshLocations: async (): Promise<void> => {
    codeInspectorState$.update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const locations = getLocationsList();
      debugActions.setLocations(locations);

      codeInspectorState$.update((state) => ({ ...state, isLoading: false }));
    } catch (error) {
      codeInspectorState$.update((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh locations',
      }));
    }
  },

  getLocationInfo: async (locationName: string): Promise<LocationInfo | null> => {
    const cache = codeInspectorState$.value.locationInfoCache;

    if (cache.has(locationName)) {
      return cache.get(locationName) || null;
    }

    codeInspectorState$.update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const code = getLocationCode(locationName);
      const actionsList = getLocationActions(locationName);
      const description = getLocationDescription(locationName);

      const actions = actionsList.map((_, index) => getActionCode(locationName, index));

      const locationInfo: LocationInfo = {
        name: locationName,
        code,
        actions,
        description,
      };

      codeInspectorState$.update((state) => ({
        ...state,
        locationInfoCache: new Map(state.locationInfoCache).set(locationName, locationInfo),
        isLoading: false,
      }));

      return locationInfo;
    } catch (error) {
      codeInspectorState$.update((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get location info',
      }));
      return null;
    }
  },

  clearCache: (): void => {
    codeInspectorState$.update((state) => ({
      ...state,
      locationInfoCache: new Map(),
    }));
  },

  getActionCode: (location: string, actionIndex: number): string[] => {
    try {
      return getActionCode(location, actionIndex);
    } catch (error) {
      console.error('Failed to get action code:', error);
      return [];
    }
  },

  searchInCode: (searchTerm: string): { location: string; matches: Array<{ line: number; text: string }> }[] => {
    const results: { location: string; matches: Array<{ line: number; text: string }> }[] = [];
    const cache = codeInspectorState$.value.locationInfoCache;

    for (const [locationName, locationInfo] of cache) {
      const matches: Array<{ line: number; text: string }> = [];

      locationInfo.code.forEach((line: string, index: number) => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push({ line: index + 1, text: line.trim() });
        }
      });

      locationInfo.actions.forEach((action: string[], actionIndex: number) => {
        action.forEach((line: string, lineIndex: number) => {
          if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
            matches.push({
              line: lineIndex + 1,
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
  },
};

export const isCodeInspectorLoading$ = codeInspectorState$.focus('isLoading');
export const codeInspectorError$ = codeInspectorState$.focus('error');
