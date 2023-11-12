import { QspListItem } from '@qsp/wasm-engine';
import { create } from 'xoid';

interface MenuAtom {
  isOpen: boolean;
  items: QspListItem[];
  onselect: null | ((index: number) => void);
}
interface MenuAtomAction {
  open(items: QspListItem[], onselect: (index: number) => void): void;
  select(index: number): void;
  close(): void;
  clear(): void;
}

export const menu$ = create<MenuAtom, MenuAtomAction>(
  {
    isOpen: false,
    items: [],
    onselect: null,
  },
  (atom) => ({
    open(items: QspListItem[], onselect: (index: number) => void): void {
      atom.set({
        isOpen: true,
        items,
        onselect,
      });
    },
    select(index: number): void {
      atom.value.onselect?.(index);
      atom.value.isOpen = false;
      atom.value.onselect = null;
    },
    close(): void {
      atom.value.onselect?.(-1);
      atom.value.isOpen = false;
      atom.value.onselect = null;
    },
    clear(): void {
      atom.set({
        isOpen: false,
        items: [],
        onselect: null,
      });
    },
  })
);
