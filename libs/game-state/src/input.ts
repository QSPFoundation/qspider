import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

export const input$ = create<{ text: string; finished: (result: string) => void } | null>(null);
export const inputResult$ = create('');
export function submitInput(): void {
  const input = input$.value;
  if (!input) return;
  input$.set(null);
  input.finished(inputResult$.value);
  inputResult$.set('');
}

qspApi$.subscribe((api) => {
  api.on('input', (text, finished) => {
    input$.set({ text, finished });
  });
});
