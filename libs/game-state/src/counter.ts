import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

export const counterDelay$ = create(500);
export const isPaused$ = create(false);
const counterTimeout$ = create<ReturnType<typeof setTimeout>>();

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
