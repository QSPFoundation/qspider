import { create } from 'xoid';

export const errorMessage$ = create('');
export const isErrorShown$ = create(false);

export function showError(message: string): void {
  errorMessage$.set(message);
  isErrorShown$.set(true);
}
