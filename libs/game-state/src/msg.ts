import { create } from 'xoid';
import { pauseCounter, resumeCounter } from './counter-pauses';

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
        pauseCounter('msg');
        atom.set({
          isOpen: true,
          content,
          onclosed,
        });
      },
      close(): void {
        if (isOpen$.value) {
          resumeCounter('msg');
          isOpen$.set(false);
          atom.value.onclosed?.();
        }
      },
      clear(): void {
        if (isOpen$.value) {
          resumeCounter('msg');
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
