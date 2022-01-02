import { QspAPI, QspErrorData, QspListItem } from '@qspider/qsp-wasm';
import { Defered } from '@qspider/utils';
import { GameDescriptor, PlayerConfig } from './game';
import { SaveAction } from './save';
import { IWindowManager } from './window-manager';

export interface IGameManager {
  readonly apiInitialized: Defered<void>;
  readonly api: QspAPI;
  readonly windowManager: IWindowManager;

  readonly config: PlayerConfig;
  readonly currentGame: GameDescriptor | null;
  readonly hasGameList: boolean;
  readonly isGameListShown: boolean;
  readonly isInitialized: boolean;
  showGameList(): void;
  hideGameList(): void;

  audioEngine: {
    readonly isMuted: boolean;
    mute(): void;
    unMute(): void;
  };

  readonly isNewLoc: boolean;
  readonly newLocHash: string;

  runGame(source: ArrayBuffer, game: GameDescriptor): void;
  openGame(source: ArrayBuffer, name: string): void;
  openGameDescriptor(game: GameDescriptor, fromConfig: boolean): Promise<void>;
  restart(): void;
  requestSave(): Promise<void>;
  requestRestore(): Promise<void>;

  readonly main: string;

  readonly stats: string;

  readonly actions: QspListItem[];

  readonly isMenuShown: boolean;
  readonly menu: QspListItem[];
  selectMenu(index: number): void;

  readonly objects: QspListItem[];
  selectObject(index: number): void;

  readonly userInput: string;
  updateUserInput(newValue: string): void;
  submitUserInput(): void;

  readonly viewSrc: string;
  readonly isViewShown: boolean;
  closeView(): void;

  readonly isInputShown: boolean;
  readonly input: string;
  closeInput(value: string): void;

  readonly isMsgShown: boolean;
  readonly msg: string;
  closeMsg(): void;

  readonly isWaiting: boolean;
  completeWaiting(): void;

  readonly saveAction: SaveAction | null;
  clearSaveAction(): void;

  errorData: QspErrorData | null;
  clearError(): void;

  execCode(code: string): void;
  selectAction(index: number): void;
  executeSelAction(): void;
  onLinkClicked(href: string): void;
}
