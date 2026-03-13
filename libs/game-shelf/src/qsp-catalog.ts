import { showError, showNotice } from '@qspider/game-state';
import { importUrl } from '@qspider/importers';
import { atom } from 'xoid';
import { games$ } from './game-shelf';
import i18n from '@qspider/i18n';
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

export const qspCatalogList$ = atom<CatalogGame[]>([]);
export const qspAuthorFilter$ = atom('');
export const qspSortByField$ = atom('created');
export const qspSortDirection$ = atom<'asc' | 'desc'>('desc');
export const qspTitleSearch$ = atom('');
export const qspFeaturedFilter$ = atom(false);
export const qspHasMore$ = atom(false);
export const qspCurrentPage$ = atom(1);
export const qspAuthors$ = atom<CatalogAuthor[]>([]);
export const qspAuthorsLoading$ = atom(false);

type CatalogLoadingState = 'pending' | 'loading' | 'loading-more' | 'loaded' | 'failed';

export const catalogLoading$ = atom<CatalogLoadingState>('pending');
export const sourceName = 'qsp.org';
const CATALOG_URL = 'https://qsp.org/api/v1/games';
const AUTHORS_URL = 'https://qsp.org/api/v1/games/authors';

export const gameUpdates$ = atom<Record<string, CatalogGame | null>>({});

const UPDATE_CHECKS_KEY = 'qspider_update_checks';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getUpdateCheckCache(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(UPDATE_CHECKS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function setUpdateCheckCache(cache: Record<string, number>): void {
  localStorage.setItem(UPDATE_CHECKS_KEY, JSON.stringify(cache));
}

export async function checkForUpdates(): Promise<void> {
  const now = Date.now();
  const cache = getUpdateCheckCache();
  const shelfGames = Object.values(games$.value).filter((game) => game.meta?.source === sourceName);
  const updates: Record<string, CatalogGame | null> = {};
  for (const game of shelfGames) {
    const slug = game.meta!.source_id;
    if (now - (cache[slug] ?? 0) < ONE_DAY_MS) continue;
    try {
      const catalogGame = await fetchCatalogGame(slug);
      const catalogDate = new Date(catalogGame.updated_at).getTime();
      updates[game.id] = game.meta!.source_date < catalogDate ? catalogGame : null;
      cache[slug] = now;
    } catch {
      // ignore failed checks
    }
  }
  setUpdateCheckCache(cache);
  gameUpdates$.update((current) => ({ ...current, ...updates }));
}

export async function fetchCatalogGame(slug: string): Promise<CatalogGame> {
  const response = await fetch(`${CATALOG_URL}/${slug}`);
  if (!response.ok) throw new Error(`Failed to load game info for ${slug}`);
  const data = await response.json();
  return data.data ?? data;
}

export async function loadQspAuthors(): Promise<void> {
  if (qspAuthorsLoading$.value) return;
  qspAuthorsLoading$.value = true;
  try {
    let page = 1;
    const allAuthors: CatalogAuthor[] = [];
    while (true) {
      const url = new URL(AUTHORS_URL);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per-page', '100');
      const request = await fetch(url.toString());
      if (!request.ok) throw new Error('Failed to load authors');
      const data = await request.json();
      const authors: CatalogAuthor[] = data.data ?? data;
      allAuthors.push(...authors);
      if (authors.length < 100) break;
      page++;
    }
    allAuthors.sort((a, b) => a.names.localeCompare(b.names));
    qspAuthors$.value = allAuthors;
  } catch (err) {
    console.error(err);
  } finally {
    qspAuthorsLoading$.value = false;
  }
}

export async function loadQspCatalog(page = 1, reset = true): Promise<void> {
  if (reset) {
    if (catalogLoading$.value === 'loading') return;
    catalogLoading$.value = 'loading';
    qspCatalogList$.value = [];
  } else {
    if (catalogLoading$.value === 'loading-more') return;
    catalogLoading$.value = 'loading-more';
  }
  try {
    const url = new URL(CATALOG_URL);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per-page', '20');
    const sortField = qspSortByField$.value;
    const sortDirection = qspSortDirection$.value;
    url.searchParams.set('sort', sortField);
    url.searchParams.set('order', sortDirection);
    const titleSearch = qspTitleSearch$.value;
    if (titleSearch) url.searchParams.set('search-name', titleSearch);
    const authorFilter = qspAuthorFilter$.value;
    if (authorFilter) url.searchParams.set('search-authors', authorFilter);
    const featured = qspFeaturedFilter$.value;
    if (featured) url.searchParams.set('featured', '1');
    const request = await fetch(url.toString());
    if (!request.ok) throw new Error('Failed to load catalog');
    const data = await request.json();
    const games: CatalogGame[] = data.data ?? data;
    if (reset) {
      qspCatalogList$.value = games;
    } else {
      qspCatalogList$.value = [...qspCatalogList$.value, ...games];
    }
    qspCurrentPage$.value = page;
    const meta = data.meta;
    qspHasMore$.value = page < meta.last_page;
    catalogLoading$.value = 'loaded';
  } catch {
    catalogLoading$.value = 'failed';
  }
}

export async function loadMoreCatalog(): Promise<void> {
  if (!qspHasMore$.value || catalogLoading$.value !== 'loaded') return;
  await loadQspCatalog(qspCurrentPage$.value + 1, false);
}

export async function moveToShelf(game: CatalogGame): Promise<GameShelfEntry[]> {
  try {
    const imported = await importUrl(game.file_url, game.file_name ?? `${game.slug}.qsp`);
    for (const entry of imported) {
      entry.title = game.name;
      entry.description = game.description_html;
      entry.icon = game.icon_url ?? '';
      entry.author = game.authors;
      entry.ported_by = game.translators ?? '';
      entry.version = game.ver;
      entry.meta = {
        source: sourceName,
        source_id: game.slug,
        source_date: new Date(game.updated_at).getTime(),
      };
      games$.actions.add(entry.id, entry);
      showNotice(
        i18n.t(`{{ name }} added to shelf`, {
          name: game.name,
        }),
      );
    }
    return imported;
  } catch (err) {
    console.error(err);
    showError(`Failed to load source for game ${game.name}`);
  }
  return [];
}


export function toggleSortDirection(): void {
  qspSortDirection$.update((current) => (current === 'asc' ? 'desc' : 'asc'));
}
