export type SaveAction =
  | {
      type: 'save';
      slots: string[];
      data: ArrayBuffer;
      callback: (slot: number) => void;
      onResult?: () => void;
    }
  | {
      type: 'restore';
      slots: string[];
      callback: (slot: number) => void;
      onResult?: () => void;
    };
