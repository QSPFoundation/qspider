// The pure parts of panels.ts: the modal view's state and which actions the keys can reach. Light: no engine.
import { atom } from 'xoid';

/** Whether `index` is one of `count` actions. */
export function isActionIndex(index: number, count: number): boolean {
  return index >= 0 && index < count;
}

/** The index of no selected action. */
export const NO_ACTION = -1;
/** The action the player picked and has not run yet. */
export const selectedAction$ = atom(NO_ACTION);

export interface ViewAtom {
  isOpen: boolean;
  path: string;
  isModal: boolean;
}
export interface ViewAtomActions {
  open(path: string): void;
  setIsModal(isModal: boolean): void;
  close(): void;
  clear(): void;
}

export const view$ = atom<ViewAtom, ViewAtomActions>(
  {
    isOpen: false,
    path: '',
    isModal: false,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    const isModal$ = atom.focus((s) => s.isModal);
    return {
      open(path: string): void {
        atom.set({
          isOpen: true,
          path,
          isModal: isModal$.value,
        });
      },
      setIsModal(isModal: boolean): void {
        isModal$.set(isModal);
      },
      close(): void {
        isOpen$.set(false);
      },
      clear(): void {
        atom.set({
          isOpen: false,
          path: '',
          isModal: false,
        });
      },
    };
  },
);
