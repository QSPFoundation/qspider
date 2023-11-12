import { create } from 'xoid';

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
        isOpen$.set(false);
        atom.value.onfinished?.(entered$.value);
        atom.value.onfinished = null;
      },
      close(): void {
        isOpen$.set(false);
        atom.value.onfinished?.('');
        atom.value.onfinished = null;
      },
      clear(): void {
        atom.value.onfinished?.('');
        atom.set({
          isOpen: false,
          content: '',
          entered: '',
          onfinished: null,
        });
      },
    };
  }
);
