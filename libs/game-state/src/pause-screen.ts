import { create } from 'xoid';
import { isPaused$ } from './counter';

export const isPauseScreenVisible$ = create(false);
export const pauseScreenCurrentPanel$ = create('credits');

isPauseScreenVisible$.subscribe((isVisible) => {
  if (isVisible) {
    isPaused$.set(true);
  } else {
    isPaused$.set(false); // TODO check collisions
  }
});
