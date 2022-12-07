import { create } from 'xoid';

export const msg$ = create<{ text: string; closed: () => void } | null>(null);
export function closeMsg(): void {
  const msg = msg$.value;
  if (!msg) return;
  msg$.set(null);
  msg.closed();
}
