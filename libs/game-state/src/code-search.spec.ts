import { describe, expect, it } from 'vitest';
import { buildLocationInfo, errorMessage, searchLocations, type LocationReader } from './code-search';
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
      { location: 'start', matches: [{ line: 2, text: '*PL "Hello"' }] },
    ]);
  });

  it('skips locations without matches', () => {
    const cache = cacheOf(info('a', ['x']), info('b', ['y']));
    expect(searchLocations(cache, 'y').map((r) => r.location)).toEqual(['b']);
  });

  it('an action match carries its own action index and line, not the location line (D21)', () => {
    const cache = cacheOf(info('start', ['a', 'b', 'c'], [['no'], ['no', 'gt "room"']]));
    const [result] = searchLocations(cache, 'gt');
    expect(result.matches).toEqual([{ actionIndex: 1, actionLine: 2, text: '[Action 1] gt "room"' }]);
  });

  it('keeps the location line on code matches next to action matches', () => {
    const cache = cacheOf(info('start', ['gt "a"'], [['gt "b"']]));
    const [result] = searchLocations(cache, 'gt');
    expect(result.matches[0]).toEqual({ line: 1, text: 'gt "a"' });
    expect(result.matches[1].line).toBeUndefined();
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
