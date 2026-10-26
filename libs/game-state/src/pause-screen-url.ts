// The URLs the pause screen moves the history to and the decision to go back, apart from the history itself.
// Light: only init.ts (the player's base URL).
import { playerUrl } from './init';

/** The player URL with `?pause=true` added to the current query. */
export function pauseOpenUrl(currentSearch: string): string {
  const search = new URLSearchParams(currentSearch);
  search.set('pause', 'true');
  return playerUrl(search);
}

/** The player URL with `pause` taken out of the current query. */
export function pauseCloseUrl(currentSearch: string): string {
  const search = new URLSearchParams(currentSearch);
  search.delete('pause');
  return playerUrl(search);
}

/** The pause screen's entry is undone by going back, unless it is the only entry (then the URL without `pause` is pushed). */
export function closesByGoingBack(historyLength: number): boolean {
  return historyLength > 1;
}
