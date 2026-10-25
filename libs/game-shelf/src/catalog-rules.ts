import { GameShelfEntry } from '@qspider/contracts';

export interface CatalogGame {
  slug: string;
  name: string;
  lang: string | null;
  ver: string;
  authors: string;
  translators: string | null;
  description_html: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  icon_url: string | null;
  cover_url: string | null;
  downloads_count: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogAuthor {
  names: string;
  games_count: number;
}

export const sourceName = 'qsp.org';
const CATALOG_URL = 'https://qsp.org/api/v1/games';
const AUTHORS_URL = 'https://qsp.org/api/v1/games/authors';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function catalogUrl(query: {
  page: number;
  sort: string;
  order: 'asc' | 'desc';
  title: string;
  author: string;
  featured: boolean;
}): string {
  const url = new URL(CATALOG_URL);
  url.searchParams.set('page', String(query.page));
  url.searchParams.set('per-page', '20');
  url.searchParams.set('sort', query.sort);
  url.searchParams.set('order', query.order);
  if (query.title) url.searchParams.set('search-name', query.title);
  if (query.author) url.searchParams.set('search-authors', query.author);
  if (query.featured) url.searchParams.set('featured', '1');
  return url.toString();
}

export function authorsUrl(page: number): string {
  const url = new URL(AUTHORS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per-page', '100');
  return url.toString();
}

export function isUpdateCheckDue(lastCheck: number | undefined, now: number): boolean {
  return now - (lastCheck ?? 0) >= ONE_DAY_MS;
}

export function hasNewerVersion(sourceDate: number, catalogUpdatedAt: string): boolean {
  return sourceDate < new Date(catalogUpdatedAt).getTime();
}

export function catalogEntryFields(
  game: CatalogGame,
): Pick<GameShelfEntry, 'title' | 'description' | 'icon' | 'author' | 'ported_by' | 'version' | 'meta'> {
  return {
    title: game.name,
    description: game.description_html,
    icon: game.icon_url ?? '',
    author: game.authors,
    ported_by: game.translators ?? '',
    version: game.ver,
    meta: {
      source: sourceName,
      source_id: game.slug,
      source_date: new Date(game.updated_at).getTime(),
    },
  };
}

export function nextSortDirection(current: 'asc' | 'desc'): 'asc' | 'desc' {
  return current === 'asc' ? 'desc' : 'asc';
}
