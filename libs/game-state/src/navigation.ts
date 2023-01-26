import { create } from 'xoid';

export const basename$ = create('/');

export function navigateTo(path: string): void {
  window.location.href = basename$.value + path;
}
