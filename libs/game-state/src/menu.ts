import { QspListItem } from '@qsp/wasm-engine';
import { create } from 'xoid';

export const menu$ = create<{ items: QspListItem[]; select: (index: number) => void } | null>(null);
export function selectMenuItem(index: number): void {
  const menu = menu$.value;
  if (!menu) return;
  const { select } = menu;
  select(index);
  menu$.set(null);
}
