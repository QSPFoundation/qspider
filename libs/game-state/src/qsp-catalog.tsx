import { GameDescriptor } from '@qspider/contracts';
import { create } from 'xoid';
import { showError, showNotice } from './toasts';
import { games$ } from './game-shelf';
import { storage$ } from './storage';

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

export const qspCatalogList$ = create<CatalogGame[]>([]);
export const qspAuthorFilter$ = create('');
export const qspSortByField$ = create('title');
export const qspSortDirection$ = create<'asc' | 'desc'>('asc');
export const qspTitleSearch$ = create('');
export const qspCatalogPreparedList$ = create<CatalogGame[]>((get) => {
  const games = get(qspCatalogList$);
  const authorFilter = get(qspAuthorFilter$);
  const sortField = get(qspSortByField$);
  const sortDirection = get(qspSortDirection$);
  const search = get(qspTitleSearch$).toLocaleLowerCase();
  let filtered = authorFilter ? games.filter((game) => game.author.includes(authorFilter)) : games.slice();
  if (search) {
    filtered = filtered.filter((game) => game.title.toLocaleLowerCase().includes(search));
  }
  filtered.sort(sortByField(sortField as keyof CatalogGame));
  if (sortDirection === 'desc') filtered.reverse();
  return filtered;
});
export const qspAuthors$ = create((get) => {
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

export const catalogLoading$ = create<CatalogLoadingState>('pending');
export const idPrefix = 'org.qsp.game-';
const CATALOG_URL = 'https://catalog-proxy.qspider.workers.dev/';
export async function loadQspCatalog(): Promise<void> {
  if (catalogLoading$.value === 'loading') return;
  catalogLoading$.value = 'loading';
  try {
    const request = await fetch(CATALOG_URL);
    if (!request.ok) throw new Error('Failed to load');
    const data = await request.json();
    qspCatalogList$.value = data;
    catalogLoading$.value = 'loaded';
  } catch {
    catalogLoading$.value = 'failed';
  }
}

export async function moveToShelf(game: CatalogGame): Promise<void> {
  const request = await fetch(`${CATALOG_URL}game-source?id=${game.id}`);
  if (!request.ok) {
    showError(`Failed to load source for game ${game.title}`);
    return;
  }
  const source = await request.arrayBuffer();
  const descriptor = convertGameToDescriptor(game);
  games$.actions.add(descriptor.id, descriptor);
  storage$.value?.addGameSource(descriptor.id, source);
  showNotice(`${game.title} added to shelf`);
}

export function toggleSortDirection(): void {
  qspSortDirection$.update((current) => (current === 'asc' ? 'desc' : 'asc'));
}

function convertGameToDescriptor(game: CatalogGame): GameDescriptor {
  return {
    id: idPrefix + game.id,
    mode: game.file_ext === 'aqsp' ? 'aero' : 'classic',
    title: game.title,
    author: game.author,
    ported_by: game.ported_by,
    version: game.version,
    file: '',
    description: game.description,
    meta: {
      source: 'org.qsp.games',
    },
  };
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
