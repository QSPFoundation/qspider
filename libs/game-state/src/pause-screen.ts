import { atom } from 'xoid';
import history from 'history/browser';
import { pauseCounter, resumeCounter } from './counter';
import { cancelPendingSaveCallbacks } from './save-routing';
import { closesByGoingBack, pauseCloseUrl, pauseOpenUrl } from './pause-screen-url';

export const isPauseScreenVisible$ = atom(false);
export const pauseScreenCurrentPanel$ = atom('credits');

export function openPauseScreen(): void {
  history.push(pauseOpenUrl(history.location.search));
}

export function onOpenPauseScreen(): void {
  isPauseScreenVisible$.set(true);
}

export function closePauseScreen(): void {
  if (closesByGoingBack(window.history.length)) {
    return history.back();
  }
  history.push(pauseCloseUrl(history.location.search));
}

export function onClosePauseScreen(): void {
  isPauseScreenVisible$.set(false);
  // A cancelled Ctrl+O / NOSAVE-Escape request must not leave the next saves panel load-only.
  cancelPendingSaveCallbacks();
}

isPauseScreenVisible$.subscribe((isVisible) => {
  if (isVisible) {
    pauseCounter('pause-screen');
  } else {
    resumeCounter('pause-screen');
  }
});
