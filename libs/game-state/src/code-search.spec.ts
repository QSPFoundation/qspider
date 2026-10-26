import { describe, expect, it } from 'vitest';
import {
  beginLoad,
  buildLocationInfo,
  cacheLocation,
  emptyCache,
  endLoad,
  errorMessage,
  failLoad,
  searchLocations,
  type CodeInspectorState,
  type LocationReader,
} from './code-search';
import type { LocationInfo } from './debug';

const info = (name: string, code: string[], actions: string[][] = []): LocationInfo => ({
  name,
  code,
  actions,
  description: '',
});

const cacheOf = (...infos: LocationInfo[]) => new Map(infos.map((i) => [i.name, i]));

describe('searchLocations', () => {
  it('finds a case-insensitive match with its 1-based line and trimmed text', () => {
    const cache = cacheOf(info('start', ['x = 1', '  *PL "Hello"  ']));
    expect(searchLocations(cache, 'hello')).toEqual([
      { location: 'start', matches: [{ kind: 'code', line: 2, text: '*PL "Hello"' }] },
    ]);
  });

  it('skips locations without matches', () => {
    const cache = cacheOf(info('a', ['x']), info('b', ['y']));
    expect(searchLocations(cache, 'y').map((r) => r.location)).toEqual(['b']);
  });

  it('an action match carries its own action index and line, not the location line (D21)', () => {
    const cache = cacheOf(info('start', ['a', 'b', 'c'], [['no'], ['no', 'gt "room"']]));
    const [result] = searchLocations(cache, 'gt');
    expect(result.matches).toEqual([{ kind: 'action', actionIndex: 1, actionLine: 2, text: '[Action 1] gt "room"' }]);
  });

  it('keeps the location line on code matches next to action matches', () => {
    const cache = cacheOf(info('start', ['gt "a"'], [['gt "b"']]));
    const [result] = searchLocations(cache, 'gt');
    expect(result.matches[0]).toEqual({ kind: 'code', line: 1, text: 'gt "a"' });
    expect(result.matches[1]).toEqual({ kind: 'action', actionIndex: 0, actionLine: 1, text: '[Action 0] gt "b"' });
  });

  it('an empty term matches nothing (D21)', () => {
    const cache = cacheOf(info('start', ['a', 'b'], [['c']]));
    expect(searchLocations(cache, '')).toEqual([]);
  });
});

describe('buildLocationInfo', () => {
  it('assembles code, one code list per action, and the description', () => {
    const reader: LocationReader = {
      getLocationCode: () => ['x = 1'],
      getLocationActions: () => ['a', 'b'],
      getActionCode: (_name, index) => [`code ${index}`],
      getLocationDescription: () => 'desc',
    };
    expect(buildLocationInfo('start', reader)).toEqual({
      name: 'start',
      code: ['x = 1'],
      actions: [['code 0'], ['code 1']],
      description: 'desc',
    });
  });

  it('lets a reader error through to the caller', () => {
    const reader: LocationReader = {
      getLocationCode: () => {
        throw new Error('no such location');
      },
      getLocationActions: () => [],
      getActionCode: () => [],
      getLocationDescription: () => '',
    };
    expect(() => buildLocationInfo('x', reader)).toThrow('no such location');
  });
});

describe('errorMessage', () => {
  it('uses the message of an Error', () => {
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('boom');
  });

  it('uses the fallback for anything else', () => {
    expect(errorMessage('boom', 'fallback')).toBe('fallback');
  });
});

describe('code inspector state transitions', () => {
  const idle: CodeInspectorState = { locationInfoCache: new Map(), isLoading: false, error: null };
  const start = info('start', ['x = 1']);

  it('beginLoad sets loading and clears an old error', () => {
    expect(beginLoad({ ...idle, error: 'old' })).toEqual({
      locationInfoCache: new Map(),
      isLoading: true,
      error: null,
    });
  });

  it('endLoad clears loading and keeps the rest', () => {
    const state = { ...idle, isLoading: true, locationInfoCache: cacheOf(start) };
    expect(endLoad(state)).toEqual({ locationInfoCache: cacheOf(start), isLoading: false, error: null });
  });

  it('failLoad stops loading and records the Error message', () => {
    expect(failLoad({ ...idle, isLoading: true }, new Error('boom'), 'fallback')).toEqual({
      locationInfoCache: new Map(),
      isLoading: false,
      error: 'boom',
    });
  });

  it('failLoad uses the fallback for a non-Error', () => {
    expect(failLoad(idle, 'boom', 'Failed to get location info').error).toBe('Failed to get location info');
  });

  it('cacheLocation adds the entry in a new Map and stops loading', () => {
    const state = { ...idle, isLoading: true };
    const next = cacheLocation(state, 'start', start);
    expect(next.locationInfoCache).toEqual(cacheOf(start));
    expect(next.isLoading).toBe(false);
    expect(state.locationInfoCache.size).toBe(0);
  });

  it('cacheLocation keeps the other cached locations', () => {
    const other = info('other', []);
    const next = cacheLocation({ ...idle, locationInfoCache: cacheOf(other) }, 'start', start);
    expect([...next.locationInfoCache.keys()]).toEqual(['other', 'start']);
  });

  it('emptyCache drops every cached location and keeps the error', () => {
    const next = emptyCache({ locationInfoCache: cacheOf(start), isLoading: false, error: 'e' });
    expect(next).toEqual({ locationInfoCache: new Map(), isLoading: false, error: 'e' });
  });
});
