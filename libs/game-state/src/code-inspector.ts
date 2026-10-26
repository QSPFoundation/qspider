import { atom } from 'xoid';
import {
  getLocationsList,
  getLocationCode,
  getLocationActions,
  getActionCode,
  getLocationDescription,
} from './qsp-api';
import { debugActions, LocationInfo } from './debug';
import {
  beginLoad,
  buildLocationInfo,
  cacheLocation,
  emptyCache,
  endLoad,
  failLoad,
  searchLocations,
  type CodeInspectorState,
  type LocationMatches,
} from './code-search';

export const codeInspectorState$ = atom<CodeInspectorState>({
  locationInfoCache: new Map(),
  isLoading: false,
  error: null,
});

export const codeInspectorActions = {
  refreshLocations: async (): Promise<void> => {
    codeInspectorState$.update(beginLoad);

    try {
      const locations = getLocationsList();
      debugActions.setLocations(locations);

      codeInspectorState$.update(endLoad);
    } catch (error) {
      codeInspectorState$.update((state) => failLoad(state, error, 'Failed to refresh locations'));
    }
  },

  getLocationInfo: async (locationName: string): Promise<LocationInfo | null> => {
    const cache = codeInspectorState$.value.locationInfoCache;

    if (cache.has(locationName)) {
      return cache.get(locationName) || null;
    }

    codeInspectorState$.update(beginLoad);

    try {
      const locationInfo = buildLocationInfo(locationName, {
        getLocationCode,
        getLocationActions,
        getActionCode,
        getLocationDescription,
      });

      codeInspectorState$.update((state) => cacheLocation(state, locationName, locationInfo));

      return locationInfo;
    } catch (error) {
      codeInspectorState$.update((state) => failLoad(state, error, 'Failed to get location info'));
      return null;
    }
  },

  clearCache: (): void => {
    codeInspectorState$.update(emptyCache);
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
