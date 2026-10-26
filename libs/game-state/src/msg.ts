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
  reset(): void;
}

export const msg$ = create<MsgAtom, MsgAtomAction>(
  {
    isOpen: false,
    content: '',
    onclosed: null,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    /** Empties the box and drops its handler without answering the engine. */
    function reset(): void {
      const { isOpen } = atom.value;
      atom.set({
        isOpen: false,
        content: '',
        onclosed: null,
      });
      if (isOpen) resumeCounter('msg');
    }
    return {
      open(content: string, onclosed: () => void): void {
        pauseCounter('msg');
        atom.set({
          isOpen: true,
          content,
          onclosed,
        });
      },
      // Close and clear reset the state before calling back: the engine resumes inside the callback, and a
      // dialog opened there must survive.
      close(): void {
        if (isOpen$.value) {
          const { onclosed } = atom.value;
          resumeCounter('msg');
          atom.update((s) => ({ ...s, isOpen: false, onclosed: null }));
          onclosed?.();
        }
      },
      clear(): void {
        const { isOpen, onclosed } = atom.value;
        reset();
        if (isOpen) onclosed?.();
      },
      reset,
    };
  },
);
