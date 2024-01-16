import { create } from 'xoid';
import { isPaused$ } from './counter';

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
    return {
      open(content: string, onfinished: (result: string) => void): void {
        isPaused$.set(true);
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
      finish(): void {
        if (isOpen$.value) {
          isOpen$.set(false);
          isPaused$.set(false);
          atom.value.onfinished?.(entered$.value);
        }
      },
      close(): void {
        if (isOpen$.value) {
          isOpen$.set(false);
          isPaused$.set(false);
          atom.value.onfinished?.('');
        }
      },
      clear(): void {
        if (isOpen$.value) {
          atom.value.onfinished?.('');
          isPaused$.set(false);
        }
        atom.set({
          isOpen: false,
          content: '',
          entered: '',
          onfinished: null,
        });
      },
    };
  },
);
