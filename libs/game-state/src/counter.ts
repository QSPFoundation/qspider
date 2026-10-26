import { atom } from 'xoid';
import { qspApi$ } from './qsp-api';
import { driveCounter } from './counter-pauses';

export * from './counter-pauses';

export const counterDelay$ = atom(500);

driveCounter(counterDelay$, () => {
  qspApi$.value?.execCounter();
});
