import { showError, showNotice } from '@qspider/game-state';
import { importUrl } from '@qspider/importers';
import { defer } from '@qspider/utils';
import { atom } from 'xoid';
import { games$ } from './game-shelf';
import i18n from '@qspider/i18n';
import { GameShelfEntry } from '@qspider/contracts';

export interface CatalogGame {
  id: number;
  author: string;
  ported_by: string;
  version: string;
  title: string;
  icon: string;
  lang: string;
  player: string;
  file_size: number;
  file_ext: string;
  pub_date: number;
  mod_date: number;
  description: string;
}

export const qspCatalogList$ = atom<CatalogGame[]>([]);
export const qspAuthorFilter$ = atom('');
export const qspSortByField$ = atom('title');
export const qspSortDirection$ = atom<'asc' | 'desc'>('asc');
export const qspTitleSearch$ = atom('');
export const onlyAero$ = atom(false);
export const qspCatalogPreparedList$ = atom<CatalogGame[]>((get) => {
  const games = get(qspCatalogList$);
  const authorFilter = get(qspAuthorFilter$);
  const sortField = get(qspSortByField$);
  const sortDirection = get(qspSortDirection$);
  const search = get(qspTitleSearch$).toLocaleLowerCase();
  const onlyAero = get(onlyAero$);
  let filtered = authorFilter ? games.filter((game) => game.author.includes(authorFilter)) : games.slice();
  if (onlyAero) {
    filtered = filtered.filter((game) => game.file_ext === 'aqsp');
  }
  if (search) {
    filtered = filtered.filter((game) => game.title.toLocaleLowerCase().includes(search));
  }
  filtered.sort(sortByField(sortField as keyof CatalogGame));
  if (sortDirection === 'desc') filtered.reverse();
  return filtered;
});
export const qspAuthors$ = atom((get) => {
  const games = get(qspCatalogList$);
  const authorsSet = new Set<string>();
  for (const game of games) {
    const authors = game.author.split(',');
    for (const author of authors) {
      if (author.trim()) authorsSet.add(author.trim());
    }
  }
  return [...authorsSet].sort((a, b) => a.localeCompare(b));
});

type CatalogLoadingState = 'pending' | 'loading' | 'loaded' | 'failed';

export const catalogLoading$ = atom<CatalogLoadingState>('pending');
export const sourceName = 'org.qsp.games';
const CATALOG_URL = 'https://catalog.qspider.xyz/';
const GAMEKIT_URL = `https://github.com/QSPFoundation/gamekit/releases/latest/download/games_package.zip`;

const catalogLoadingDeferred = defer<void>();
export async function loadQspCatalog(): Promise<void> {
  if (catalogLoading$.value === 'loading') return catalogLoadingDeferred.promise;
  catalogLoading$.value = 'loading';
  try {
    const request = await fetch(CATALOG_URL);
    if (!request.ok) throw new Error('Failed to load catalog');
    const data = await request.json();
    qspCatalogList$.value = data;
    catalogLoading$.value = 'loaded';
  } catch {
    catalogLoading$.value = 'failed';
  }
  catalogLoadingDeferred.resolve();
  return catalogLoadingDeferred.promise;
}

export async function moveToShelf(game: CatalogGame): Promise<GameShelfEntry[]> {
  try {
    const imported = await importUrl(`${CATALOG_URL}game-source?id=${game.id}`, `qsp-game-${game.id}.${game.file_ext}`);
    for (const entry of imported) {
      entry.title = game.title;
      entry.description = game.description;
      entry.icon = `https://qsp.su/gamestock/image.php?name=${game.icon}`;
      entry.author = game.author;
      entry.ported_by = game.ported_by;
      entry.version = game.version;
      entry.meta = {
        source: 'org.qsp.games',
        source_id: String(game.id),
        source_date: game.mod_date,
      };
      games$.actions.add(entry.id, entry);
      showNotice(
        i18n.t(`{{ name }} added to shelf`, {
          name: game.title,
        }),
      );
    }
    return imported;
  } catch (err) {
    console.error(err);
    showError(`Failed to load source for game ${game.title}`);
  }
  return [];
}

export async function importGameKit(): Promise<void> {
  try {
    const imported = await importUrl(GAMEKIT_URL, 'games_package.zip');
    for (const entry of imported) {
      games$.actions.add(entry.id, entry);
    }
    showNotice(
      i18n.t(`{{ count }} games added to shelf`, {
        count: imported.length,
      }),
    );
  } catch (err) {
    console.error(err);
    showError(`Failed to load gamekit`);
  }
}

export function toggleSortDirection(): void {
  qspSortDirection$.update((current) => (current === 'asc' ? 'desc' : 'asc'));
}

function sortByField<T, K extends keyof T>(fieldName: K) {
  return (a: T, b: T): number => {
    const aValue = a[fieldName];
    const bValue = b[fieldName];
    if (typeof aValue === 'number' && typeof bValue === 'number') return aValue - bValue;
    if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue);
    if (aValue === bValue) return 0;
    return aValue < bValue ? 1 : -1;
  };
}
