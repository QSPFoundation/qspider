// The pure parts of panels.ts: the modal view's state, which actions the keys can reach, and how a variable
// from the game becomes a layer flag or a region text. Light: no engine.
import { atom } from 'xoid';

/** Whether `index` is one of `count` actions. */
export function isActionIndex(index: number, count: number): boolean {
  return index >= 0 && index < count;
}

/** A layer is shown when the game's `qspider_layers[name]` is set to anything but 0 (unset counts as 0). */
export function layerFlag(value: unknown): boolean {
  return Boolean(value ?? 0);
}

/** The text the game keeps for a region; '' when it keeps none. */
export function regionText(value: string | undefined | null): string {
  return value ?? '';
}

/** `names` mapped to what `read` answers for each. */
export function readAll<T>(names: Iterable<string>, read: (name: string) => T): Record<string, T> {
  const state: Record<string, T> = {};
  for (const name of names) state[name] = read(name);
  return state;
}

/** The index of no selected action. */
export const NO_ACTION = -1;
/** The action the player picked and has not run yet. */
export const selectedAction$ = atom(NO_ACTION);

/** `layers` with `name` set to `shown`; the others are kept. */
export function withLayer(layers: Record<string, boolean>, name: string, shown: boolean): Record<string, boolean> {
  return { ...layers, [name]: shown };
}

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
