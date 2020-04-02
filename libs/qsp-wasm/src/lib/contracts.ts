import { QspPanel } from '../wasm/types';

export interface LayoutSettings {
  useHtml: boolean;
}

export type QspEvents = {
  main_changed: (text: string) => void;
  stats_changed: (text: string) => void;
  actions_changed: (actions: QspListItem[]) => void;
  objects_changed: (objects: QspListItem[]) => void;
  panel_visibility: (type: QspPanel, isShown: boolean) => void;
  error: (errorData: QspErrorData) => void;
  layout: (settings: LayoutSettings) => void;
  menu: (items: QspListItem[], select: (index: number) => void) => void;
  msg: (text: string, closed: () => void) => void;
  input: (text: string, onInput: (text: string) => void) => void;
};

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  createGameWorld(data: ArrayBuffer, fileName: string): boolean;
  restartGame(): boolean;
  selectAction(index: number): boolean;
  selectObject(index: number): boolean;
  readVariableNumber(name: string, index?: number): number;
  readVariableString(name: string, index?: number): string;
  execCode(code: string): boolean;
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
