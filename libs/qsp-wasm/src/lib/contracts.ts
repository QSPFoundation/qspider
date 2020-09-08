import { QspPanel } from '../qsplib/public/types';

export interface LayoutSettings {
  useHtml: boolean;
  backgroundColor: string;
  backgroundImage: string;
  color: string;
  linkColor: string;
  fontSize: number;
  fontName: string;
}

export type QspEvents = {
  main_changed: (text: string) => void;
  stats_changed: (text: string) => void;
  actions_changed: (actions: QspListItem[]) => void;
  objects_changed: (objects: QspListItem[]) => void;
  panel_visibility: (type: QspPanel, isShown: boolean) => void;
  user_input: (text: string) => void;
  error: (errorData: QspErrorData) => void;
  layout: (settings: LayoutSettings) => void;
  menu: (items: QspListItem[], select: (index: number) => void) => void;
  msg: (text: string, closed: () => void) => void;
  input: (text: string, onInput: (text: string) => void) => void;
  wait: (ms: number, onComplete: () => void) => void;
  timer: (ms: number) => void;
  view: (path: string) => void;
  open_game: (path: string, isNewGame: boolean, onOpened: () => void) => void;
  save_game: (path: string, onSaved: () => void) => void;
  load_save: (path: string, onLoaded: () => void) => void;
  is_play: (file: string, onResult: (result: boolean) => void) => void;
  play_file: (path: string, volume: number, onReady: () => void) => Promise<void>;
  close_file: (path: string, onReady: () => void) => void;
};

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  openGame(data: ArrayBuffer, fileName: string, isNewGame: boolean): void;
  saveGame(): ArrayBuffer;
  loadSave(data: ArrayBuffer): void;
  restartGame(): boolean;
  selectAction(index: number): boolean;
  selectObject(index: number): boolean;
  readVariableNumber(name: string, index?: number): number;
  readVariableString(name: string, index?: number): string;
  execCode(code: string): boolean;
  execCounter(): void;
  execUserInput(code: string): boolean;
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
