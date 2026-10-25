import { describe, expect, it } from 'vitest';
import type { GameShelfEntry } from '@qspider/contracts';
import { findCatalogEntry } from './catalog-launch';

const entry = (id: string, sourceId?: string): GameShelfEntry => ({
  id,
  mode: 'classic',
  title: id,
  loadConfig: { url: '', entrypoint: 'game.qsp' },
  ...(sourceId ? { meta: { source: 'qsp.org', source_id: sourceId, source_date: 0 } } : {}),
});

describe('findCatalogEntry', () => {
  it('finds the entry imported from the catalog game', () => {
    const games = { a: entry('a'), b: entry('b', 'slug-b'), c: entry('c', 'slug-c') };
    expect(findCatalogEntry(games, 'slug-c')).toBe(games.c);
  });

  it('returns the first of several entries with the same catalog id', () => {
    const games = { a: entry('a', 'slug'), b: entry('b', 'slug') };
    expect(findCatalogEntry(games, 'slug')).toBe(games.a);
  });

  it('returns undefined when no entry comes from that catalog game', () => {
    expect(findCatalogEntry({ a: entry('a'), b: entry('b', 'slug-b') }, 'slug-x')).toBeUndefined();
  });

  it('returns undefined for an empty shelf', () => {
    expect(findCatalogEntry({}, 'slug')).toBeUndefined();
  });
});
