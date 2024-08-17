import { QspListItem } from '@qsp/wasm-engine';
import { atom } from 'xoid';

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

export const selectedMenuItem$ = atom(-1);
export const menu$ = atom<MenuAtom, MenuAtomAction>(
  {
    isOpen: false,
    items: [],
    onselect: null,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    return {
      open(items: QspListItem[], onselect: (index: number) => void): void {
        atom.set({
          isOpen: true,
          items,
          onselect,
        });
      },
      select(index: number): void {
        isOpen$.set(false);
        atom.value.onselect?.(index);
        atom.value.onselect = null;
      },
      close(): void {
        isOpen$.set(false);
        atom.value.onselect?.(-1);
        atom.value.onselect = null;
      },
      clear(): void {
        if (isOpen$.value) atom.value.onselect?.(-1);
        atom.set({
          isOpen: false,
          items: [],
          onselect: null,
        });
      },
    };
  },
);
