import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

export const msg$ = create<{ text: string; closed: () => void } | null>(null);
export function closeMsg(): void {
  const msg = msg$.value;
  if (!msg) return;
  msg$.set(null);
  msg.closed();
}

qspApi$.subscribe((api) => {
  api.on('msg', (text, closed) => {
    msg$.set({ text, closed });
  });
});
