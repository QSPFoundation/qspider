import { atom } from 'xoid';

/**
 * Storage writes of games$ actions still in flight. The UI stays optimistic (it does not wait for
 * them); this counter lets a caller that must not unload the page yet (e.g. e2e before a restart)
 * see when they have settled.
 */
export const pendingWrites$ = atom(0);

export function trackWrite(write: Promise<void>): void {
  pendingWrites$.update((n) => n + 1);
  write.catch(console.error).finally(() => pendingWrites$.update((n) => n - 1));
}
