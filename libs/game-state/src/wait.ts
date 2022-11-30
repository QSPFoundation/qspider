import { create } from 'xoid';
import { isPaused$ } from './counter';
import { qspApi$ } from './qsp-api';

export const wait$ = create<{ ms: number; finish: () => void } | null>(null);
const waitTimeout$ = create<ReturnType<typeof setTimeout>>();

export function finishWait(): void {
  const wait = wait$.value;
  if (!wait) return;
  clearTimeout(waitTimeout$.value);
  isPaused$.set(false);
  wait$.set(null);
  wait.finish();
}

qspApi$.subscribe((api) => {
  api.on('wait', (ms, finish) => {
    wait$.set({ ms, finish });
  });
});
wait$.subscribe((wait) => {
  if (wait) {
    clearTimeout(waitTimeout$.value);
    isPaused$.set(true);
    waitTimeout$.set(
      setTimeout(() => {
        finishWait();
      }, wait.ms)
    );
  }
});
