import { atom } from 'xoid';
import history from 'history/browser';
import { isPaused$ } from './counter';
import { gameSavedCallback$, saveLoadedCallback$ } from './save';

export const isPauseScreenVisible$ = atom(false);
export const pauseScreenCurrentPanel$ = atom('credits');

export function openPauseScreen(): void {
  const search = new URLSearchParams(history.location.search);
  search.set('pause', 'true');
  history.push({
    search: search.toString(),
  });
}

export function onOpenPauseScreen(): void {
  isPauseScreenVisible$.set(true);
}

export function closePauseScreen(): void {
  if (window.history.length > 1) {
    return history.back();
  }
  const search = new URLSearchParams(history.location.search);
  search.delete('pause');
  history.push({
    search: search.toString(),
  });
}

export function onClosePauseScreen(): void {
  isPauseScreenVisible$.set(false);
  if (saveLoadedCallback$.value) {
    saveLoadedCallback$.value();
    saveLoadedCallback$.set(null);
  }
  if (gameSavedCallback$.value) {
    gameSavedCallback$.value();
    gameSavedCallback$.set(null);
  }
}

isPauseScreenVisible$.subscribe((isVisible) => {
  if (isVisible) {
    isPaused$.set(true);
  } else {
    isPaused$.set(false); // TODO check collisions
  }
});
