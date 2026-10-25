import { showError, showNotice } from '@qspider/game-state';
import { importUrl } from '@qspider/importers';
import { atom } from 'xoid';
import { games$ } from './game-shelf';
import i18n from '@qspider/i18n';
import { GameShelfEntry } from '@qspider/contracts';
import {
  authorsUrl,
  catalogEntryFields,
  catalogUrl,
  hasNewerVersion,
  isUpdateCheckDue,
  nextSortDirection,
  sourceName,
  type CatalogAuthor,
  type CatalogGame,
} from './catalog-rules';

export { sourceName, type CatalogAuthor, type CatalogGame };

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
const CATALOG_URL = 'https://qsp.org/api/v1/games';

export const gameUpdates$ = atom<Record<string, CatalogGame | null>>({});

const UPDATE_CHECKS_KEY = 'qspider_update_checks';

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
    if (!isUpdateCheckDue(cache[slug], now)) continue;
    try {
      const catalogGame = await fetchCatalogGame(slug);
      updates[game.id] = hasNewerVersion(game.meta!.source_date, catalogGame.updated_at) ? catalogGame : null;
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
      const request = await fetch(authorsUrl(page));
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
    const url = catalogUrl({
      page,
      sort: qspSortByField$.value,
      order: qspSortDirection$.value,
      title: qspTitleSearch$.value,
      author: qspAuthorFilter$.value,
      featured: qspFeaturedFilter$.value,
    });
    const request = await fetch(url);
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
      Object.assign(entry, catalogEntryFields(game));
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
  qspSortDirection$.update((current) => nextSortDirection(current));
}
