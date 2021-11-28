export type SaveAction =
  | {
      type: 'save';
      slots: Array<string | null>;
      data: ArrayBuffer;
      callback: (slot: number) => void;
      onResult?: () => void;
    }
  | {
      type: 'restore';
      slots: Array<string | null>;
      callback: (slot: number) => void;
      onResult?: () => void;
    };
