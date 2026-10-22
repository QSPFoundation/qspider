import { atom, type Atom } from 'xoid';
import { qspApi$ } from './qsp-api';

export const counterDelay$ = atom(500);

/** Why the counter is paused. `no-game`: no game is running (the initial state). */
export type CounterPauseReason = 'no-game' | 'pause-screen' | 'msg' | 'input' | 'menu' | 'wait';

/**
 * The active pause reasons: named ones, plus one unique token per running withCounterPaused.
 * The counter runs only while the set is empty, so independent pauses cannot clobber each other.
 */
const pauseReasons$ = atom<ReadonlySet<CounterPauseReason | symbol>>(new Set(['no-game']));

type ReadonlyAtom<T> = Pick<Atom<T>, 'subscribe' | 'watch'> & { readonly value: T };

/** Whether the counter is paused: any pause reason is active. Derived, read-only. */
export const isPaused$: ReadonlyAtom<boolean> = atom((get) => get(pauseReasons$).size > 0);
const counterTimeout$ = atom<ReturnType<typeof setTimeout>>();

function addReason(reason: CounterPauseReason | symbol): void {
  pauseReasons$.update((reasons) => (reasons.has(reason) ? reasons : new Set(reasons).add(reason)));
}

function removeReason(reason: CounterPauseReason | symbol): void {
  pauseReasons$.update((reasons) => {
    if (!reasons.has(reason)) return reasons;
    const next = new Set(reasons);
    next.delete(reason);
    return next;
  });
}

export function pauseCounter(reason: CounterPauseReason): void {
  addReason(reason);
}

export function resumeCounter(reason: CounterPauseReason): void {
  removeReason(reason);
}

/** Replaces every active reason (including running withCounterPaused tokens) with `reasons`. Game start/stop only. */
export function resetCounterPauses(...reasons: CounterPauseReason[]): void {
  pauseReasons$.set(new Set(reasons));
}

export async function withCounterPaused(callback: () => Promise<void>): Promise<void> {
  const token = Symbol('withCounterPaused');
  addReason(token);
  try {
    await callback();
  } finally {
    removeReason(token);
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
