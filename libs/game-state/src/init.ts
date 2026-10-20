import { defer } from '@qspider/utils';
import { atom } from 'xoid';

export const baseInit$ = atom(false);
export const initDeferred$ = atom(defer<void>());
export const initialBaseUrl$ = atom('/');

/**
 * Absolute player URL with the given query. History entries must not be resolved against
 * `<base href>`, which points at the running game and may be another origin (desktop `qsp://`, remote games).
 */
export function playerUrl(search: string | URLSearchParams): string {
  const query = search.toString().replace(/^\?/, '');
  return query ? `${initialBaseUrl$.value}?${query}` : initialBaseUrl$.value;
}
