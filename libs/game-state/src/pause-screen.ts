import { atom } from 'xoid';
import history from 'history/browser';
import { pauseCounter, resumeCounter } from './counter';
import { gameSavedCallback$, requestedAction$, saveLoadedCallback$ } from './save';
import { playerUrl } from './init';

export const isPauseScreenVisible$ = atom(false);
export const pauseScreenCurrentPanel$ = atom('credits');

export function openPauseScreen(): void {
  const search = new URLSearchParams(history.location.search);
  search.set('pause', 'true');
  history.push(playerUrl(search));
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
  history.push(playerUrl(search));
}

export function onClosePauseScreen(): void {
  isPauseScreenVisible$.set(false);
  // A cancelled Ctrl+O / NOSAVE-Escape request must not leave the next saves panel load-only.
  requestedAction$.set(null);
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
    pauseCounter('pause-screen');
  } else {
    resumeCounter('pause-screen');
  }
});
