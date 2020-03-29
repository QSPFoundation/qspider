export type QspEvents = {
  error: (errorData: QspErrorData) => void;
  menu: () => void;
};

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  createGameWorld(data: ArrayBuffer, fileName: string): boolean;
}

export interface QspErrorData {
  code: number;
  description: string;
  location: string;
  actionIndex: number;
  line: number;
}
