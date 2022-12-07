import { create } from 'xoid';

export const input$ = create<{ text: string; finished: (result: string) => void } | null>(null);
export const inputResult$ = create('');
export function submitInput(): void {
  const input = input$.value;
  if (!input) return;
  input$.set(null);
  input.finished(inputResult$.value);
  inputResult$.set('');
}
