import { create } from 'xoid';
import { pauseCounter, resumeCounter } from './counter-pauses';

interface InputAtom {
  isOpen: boolean;
  content: string;
  entered: string;
  onfinished: null | ((result: string) => void);
}
interface InputAtomActions {
  open(content: string, onfinished: (result: string) => void): void;
  enter(value: string): void;
  finish(): void;
  close(): void;
  clear(): void;
}

export const input$ = create<InputAtom, InputAtomActions>(
  {
    isOpen: false,
    content: '',
    entered: '',
    onfinished: null,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    const entered$ = atom.focus((s) => s.entered);
    function answer(result: string): void {
      if (!isOpen$.value) return;
      const { onfinished } = atom.value;
      atom.update((s) => ({ ...s, isOpen: false, onfinished: null }));
      resumeCounter('input');
      onfinished?.(result);
    }
    return {
      open(content: string, onfinished: (result: string) => void): void {
        pauseCounter('input');
        atom.set({
          isOpen: true,
          content,
          entered: '',
          onfinished,
        });
      },
      enter(value: string): void {
        entered$.set(value);
      },
      // Each answer resets the state before calling back: the engine resumes inside the callback, and a
      // prompt opened there must survive.
      finish(): void {
        answer(entered$.value);
      },
      close(): void {
        answer('');
      },
      clear(): void {
        const { isOpen, onfinished } = atom.value;
        atom.set({
          isOpen: false,
          content: '',
          entered: '',
          onfinished: null,
        });
        if (isOpen) {
          resumeCounter('input');
          onfinished?.('');
        }
      },
    };
  },
);
