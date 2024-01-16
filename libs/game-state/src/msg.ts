import { create } from 'xoid';
import { isPaused$ } from './counter';

interface MsgAtom {
  isOpen: boolean;
  content: string;
  onclosed: null | (() => void);
}
interface MsgAtomAction {
  open(content: string, onclosed: () => void): void;
  close(): void;
  clear(): void;
}

export const msg$ = create<MsgAtom, MsgAtomAction>(
  {
    isOpen: false,
    content: '',
    onclosed: null,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    return {
      open(content: string, onclosed: () => void): void {
        isPaused$.set(true);
        atom.set({
          isOpen: true,
          content,
          onclosed,
        });
      },
      close(): void {
        if (isOpen$.value) {
          isPaused$.set(false);
          isOpen$.set(false);
          atom.value.onclosed?.();
        }
      },
      clear(): void {
        if (isOpen$.value) {
          isPaused$.set(false);
          atom.value.onclosed?.();
        }
        atom.set({
          isOpen: false,
          content: '',
          onclosed: null,
        });
      },
    };
  },
);
