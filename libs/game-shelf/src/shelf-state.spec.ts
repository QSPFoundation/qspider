import { describe, expect, it } from 'vitest';
import { GameShelfEntry } from '@qspider/contracts';
import { addGame, removeGame, sortByTitle, sourceMap, updateGame } from './shelf-state';

const entry = (id: string, title = id, source?: [string, string]): GameShelfEntry => ({
  id,
  title,
  mode: 'classic',
  loadConfig: { url: `${id}/`, entrypoint: `${id}.qsps` },
  ...(source ? { meta: { source: source[0], source_id: source[1], source_date: 0 } } : {}),
});

describe('addGame', () => {
  it('returns a new object with the entry added and leaves the input untouched', () => {
    const games = { a: entry('a') };
    const next = addGame(games, 'b', entry('b'));
    expect(Object.keys(next)).toEqual(['a', 'b']);
    expect(next).not.toBe(games);
    expect(Object.keys(games)).toEqual(['a']);
  });

  it('overwrites an entry with the same id', () => {
    const next = addGame({ a: entry('a', 'Old') }, 'a', entry('a', 'New'));
    expect(next['a'].title).toBe('New');
  });
});

describe('updateGame', () => {
  it('merges the data into the entry without touching the input', () => {
    const games = { a: entry('a', 'Old') };
    const next = updateGame(games, 'a', { title: 'New' });
    expect(next['a']).toEqual({ ...entry('a'), title: 'New' });
    expect(games['a'].title).toBe('Old');
  });

  it('creates the entry from the partial data when the id is missing', () => {
    expect(updateGame({}, 'a', { title: 'T' })).toEqual({ a: { title: 'T' } });
  });
});

describe('removeGame', () => {
  it('returns a new object without the entry and leaves the input untouched', () => {
    const games = { a: entry('a'), b: entry('b') };
    const next = removeGame(games, 'a');
    expect(Object.keys(next)).toEqual(['b']);
    expect(Object.keys(games)).toEqual(['a', 'b']);
  });

  it('returns an equal object when the id is missing', () => {
    const games = { a: entry('a') };
    expect(removeGame(games, 'x')).toEqual(games);
  });
});

describe('sortByTitle', () => {
  it('orders the entries by localeCompare of the title', () => {
    const games = { 1: entry('1', 'b'), 2: entry('2', 'a') };
    expect(sortByTitle(games).map((g) => g.title)).toEqual(['a', 'b']);
  });
});

describe('sourceMap', () => {
  it('groups source ids per source', () => {
    const games = {
      a: entry('a', 'a', ['qsp.org', 'one']),
      b: entry('b', 'b', ['qsp.org', 'two']),
      c: entry('c', 'c', ['other', 'three']),
    };
    expect(sourceMap(games)).toEqual(
      new Map([
        ['qsp.org', new Set(['one', 'two'])],
        ['other', new Set(['three'])],
      ]),
    );
  });

  it('skips entries without a source', () => {
    expect(sourceMap({ a: entry('a') }).size).toBe(0);
  });
});
