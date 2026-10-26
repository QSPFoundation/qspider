import type { QspListItem } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { pauseCounter, resumeCounter } from './counter-pauses';

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
    function answer(index: number): void {
      if (!isOpen$.value) return;
      const { onselect } = atom.value;
      resumeCounter('menu');
      atom.update((s) => ({ ...s, isOpen: false, onselect: null }));
      onselect?.(index);
    }
    return {
      open(items: QspListItem[], onselect: (index: number) => void): void {
        pauseCounter('menu');
        atom.set({
          isOpen: true,
          items,
          onselect,
        });
      },
      // Each answer resets the state before calling back: the engine resumes inside the callback, and a menu
      // opened there (MENU from a menu item's location) must not be closed or lose its handler afterwards.
      select(index: number): void {
        answer(index);
      },
      close(): void {
        answer(-1);
      },
      clear(): void {
        const { isOpen, onselect } = atom.value;
        atom.set({
          isOpen: false,
          items: [],
          onselect: null,
        });
        if (isOpen) {
          resumeCounter('menu');
          onselect?.(-1);
        }
      },
    };
  },
);
