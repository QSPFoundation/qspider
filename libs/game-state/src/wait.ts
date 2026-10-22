import { create } from 'xoid';
import { pauseCounter, resumeCounter } from './counter';

export const wait$ = create<{ ms: number; finish: () => void } | null>(null);
const waitTimeout$ = create<ReturnType<typeof setTimeout>>();

export function finishWait(): void {
  const wait = wait$.value;
  if (!wait) return;
  clearTimeout(waitTimeout$.value);
  resumeCounter('wait');
  wait$.set(null);
  wait.finish();
}

wait$.subscribe((wait) => {
  if (wait) {
    clearTimeout(waitTimeout$.value);
    pauseCounter('wait');
    waitTimeout$.set(
      setTimeout(() => {
        finishWait();
      }, wait.ms),
    );
  }
});
