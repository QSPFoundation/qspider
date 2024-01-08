import { create } from 'xoid';

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
        atom.set({
          isOpen: true,
          content,
          onclosed,
        });
      },
      close(): void {
        if (isOpen$.value) {
          isOpen$.set(false);
          atom.value.onclosed?.();
        }
      },
      clear(): void {
        atom.value.onclosed?.();
        atom.set({
          isOpen: false,
          content: '',
          onclosed: null,
        });
      },
    };
  },
);
