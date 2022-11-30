import { QspListItem } from '@qsp/wasm-engine';
import { create } from 'xoid';
import { qspApi$ } from './qsp-api';
import { prepareList } from './utils';

export const menu$ = create<{ items: QspListItem[]; select: (index: number) => void } | null>(null);
export function selectMenuItem(index: number): void {
  const menu = menu$.value;
  if (!menu) return;
  const { select } = menu;
  select(index);
  menu$.set(null);
}

qspApi$.subscribe((api) => {
  api.on('menu', (items, select) => {
    menu$.set({
      items: prepareList(items),
      select,
    });
  });
});
