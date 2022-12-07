import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

export const counterDelay$ = create(500);
export const isPaused$ = create(false);
const counterTimeout$ = create<ReturnType<typeof setTimeout>>();

export async function withCounterPaused(callback: () => Promise<void>): Promise<void> {
  const prevValue = isPaused$.value;
  try {
    isPaused$.set(true);
    await callback();
  } finally {
    isPaused$.set(prevValue);
  }
}

function scheduleCounter(): void {
  counterTimeout$.set(
    setTimeout(() => {
      qspApi$.value?.execCounter();
      scheduleCounter();
    }, counterDelay$.value)
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
