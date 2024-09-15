import { atom } from 'xoid';
import { qspApi$ } from './qsp-api';

export const counterDelay$ = atom(500);
export const isPaused$ = atom(true);
const counterTimeout$ = atom<ReturnType<typeof setTimeout>>();

const pauseStack: boolean[] = [];

export async function withCounterPaused(callback: () => Promise<void>): Promise<void> {
  pauseStack.push(isPaused$.value);
  try {
    isPaused$.set(true);
    await callback();
  } finally {
    const prevValue = pauseStack.pop() || false;
    isPaused$.set(prevValue);
  }
}

function scheduleCounter(): void {
  counterTimeout$.set(
    setTimeout(() => {
      qspApi$.value?.execCounter();
      scheduleCounter();
    }, counterDelay$.value),
  );
}

isPaused$.watch((isPaused) => {
  if (isPaused) {
    clearTimeout(counterTimeout$.value);
  } else {
    scheduleCounter();
  }
});
counterDelay$.subscribe(() => {
  clearTimeout(counterTimeout$.value);
  if (!isPaused$.value) {
    scheduleCounter();
  }
});
