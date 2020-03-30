export type QspEvents = {
  main_changed: (text: string) => void;
  stats_changed: (text: string) => void;
  actions_changed: (actions: QspListItem[]) => void;
  objects_changed: (objects: QspListItem[]) => void;
  error: (errorData: QspErrorData) => void;
  menu: () => void;
};

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  createGameWorld(data: ArrayBuffer, fileName: string): boolean;
  restartGame(): boolean;
  selectAction(index: number): boolean;
  selectObject(index: number): boolean;
}

export interface QspErrorData {
  code: number;
  description: string;
  location: string;
  actionIndex: number;
  line: number;
}

export interface QspListItem {
  name: string;
  image: string;
}
