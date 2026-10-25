import { describe, expect, it } from 'vitest';
import {
  authorsUrl,
  catalogEntryFields,
  catalogUrl,
  CatalogGame,
  hasNewerVersion,
  isUpdateCheckDue,
  nextSortDirection,
} from './catalog-rules';

const DAY = 24 * 60 * 60 * 1000;
const query = { page: 2, sort: 'created', order: 'desc' as const, title: '', author: '', featured: false };

const game: CatalogGame = {
  slug: 'my-game',
  name: 'My Game',
  lang: 'ru',
  ver: '1.2',
  authors: 'An Author',
  translators: 'A Translator',
  description_html: '<p>Hi</p>',
  file_url: 'https://qsp.org/f.qsp',
  file_name: 'f.qsp',
  file_size: 10,
  icon_url: 'https://qsp.org/i.png',
  cover_url: null,
  downloads_count: 0,
  plays_count: 0,
  likes_count: 0,
  comments_count: 0,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2021-02-03T04:05:06Z',
};

describe('catalogUrl', () => {
  it('has no search parameters when no filters are set', () => {
    expect(catalogUrl(query)).toBe('https://qsp.org/api/v1/games?page=2&per-page=20&sort=created&order=desc');
  });

  it('appends the title, author and featured filters in that order', () => {
    expect(catalogUrl({ ...query, title: 'a b', author: 'c', featured: true })).toBe(
      'https://qsp.org/api/v1/games?page=2&per-page=20&sort=created&order=desc&search-name=a+b&search-authors=c&featured=1',
    );
  });
});

describe('authorsUrl', () => {
  it('asks for a page of 100 authors', () => {
    expect(authorsUrl(3)).toBe('https://qsp.org/api/v1/games/authors?page=3&per-page=100');
  });
});

describe('isUpdateCheckDue', () => {
  it('is due when the game was never checked', () => {
    expect(isUpdateCheckDue(undefined, DAY * 100)).toBe(true);
  });

  it('is due exactly one day after the last check', () => {
    expect(isUpdateCheckDue(1000, 1000 + DAY)).toBe(true);
  });

  it('is not due one millisecond short of a day', () => {
    expect(isUpdateCheckDue(1000, 1000 + DAY - 1)).toBe(false);
  });
});

describe('hasNewerVersion', () => {
  it('is true when the catalog was updated after the shelf copy', () => {
    expect(hasNewerVersion(new Date('2021-01-01T00:00:00Z').getTime(), game.updated_at)).toBe(true);
  });

  it('is false when the shelf copy is as new as the catalog', () => {
    expect(hasNewerVersion(new Date(game.updated_at).getTime(), game.updated_at)).toBe(false);
  });

  it('is false when the shelf copy is newer than the catalog', () => {
    expect(hasNewerVersion(new Date('2022-01-01T00:00:00Z').getTime(), game.updated_at)).toBe(false);
  });
});

describe('catalogEntryFields', () => {
  it('maps the catalog game onto the shelf entry fields', () => {
    expect(catalogEntryFields(game)).toEqual({
      title: 'My Game',
      description: '<p>Hi</p>',
      icon: 'https://qsp.org/i.png',
      author: 'An Author',
      ported_by: 'A Translator',
      version: '1.2',
      meta: { source: 'qsp.org', source_id: 'my-game', source_date: new Date('2021-02-03T04:05:06Z').getTime() },
    });
  });

  it('uses empty strings for a missing icon and translators', () => {
    const fields = catalogEntryFields({ ...game, translators: null, icon_url: null });
    expect(fields.ported_by).toBe('');
    expect(fields.icon).toBe('');
  });
});

describe('nextSortDirection', () => {
  it('flips ascending to descending', () => {
    expect(nextSortDirection('asc')).toBe('desc');
  });

  it('flips descending to ascending', () => {
    expect(nextSortDirection('desc')).toBe('asc');
  });
});
