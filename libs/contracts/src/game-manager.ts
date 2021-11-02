import { GameDescriptor, PlayerConfig } from './game';
import { SaveAction } from './save';

export interface IGameManager {
  readonly config: PlayerConfig;
  readonly currentGame: GameDescriptor | null;
  readonly hasGameList: boolean;
  readonly isGameListShown: boolean;
  showGameList(): void;
  hideGameList(): void;

  audioEngine: {
    readonly isMuted: boolean;
    mute(): void;
    unMute(): void;
  };

  openGameDescriptor(game: GameDescriptor): Promise<void>;
  restart(): void;
  requestSave(): Promise<void>;
  requestRestore(): Promise<void>;

  readonly isWaiting: boolean;
  completeWaiting(): void;

  readonly saveAction: SaveAction;
  clearSaveAction(): void;

  execCode(code: string): void;
  selectAction(index: number): void;
  executeSelAction(): void;
  onLinkClicked(href: string): void;
}
