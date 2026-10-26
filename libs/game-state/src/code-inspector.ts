import { atom } from 'xoid';
import {
  getLocationsList,
  getLocationCode,
  getLocationActions,
  getActionCode,
  getLocationDescription,
} from './qsp-api';
import { debugActions, LocationInfo } from './debug';
import { buildLocationInfo, errorMessage, searchLocations, type LocationMatches } from './code-search';

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
        error: errorMessage(error, 'Failed to refresh locations'),
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
      const locationInfo = buildLocationInfo(locationName, {
        getLocationCode,
        getLocationActions,
        getActionCode,
        getLocationDescription,
      });

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
        error: errorMessage(error, 'Failed to get location info'),
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

  searchInCode: (searchTerm: string): LocationMatches[] =>
    searchLocations(codeInspectorState$.value.locationInfoCache, searchTerm),
};

export const isCodeInspectorLoading$ = codeInspectorState$.focus('isLoading');
export const codeInspectorError$ = codeInspectorState$.focus('error');
