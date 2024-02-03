import { create } from 'xoid';
import { isPaused$ } from './counter';
import { gameSavedCallback$, saveLoadedCallback$ } from './save';

export const isPauseScreenVisible$ = create(false);
export const pauseScreenCurrentPanel$ = create('credits');

export function openPauseScreen(): void {
  isPauseScreenVisible$.set(true);
}

export function closePauseScreen(): void {
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
