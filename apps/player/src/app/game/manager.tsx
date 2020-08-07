import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action } from 'mobx';
import {
  fetchGameDescriptor,
  GameDescriptor,
  fetchGameSource,
  GAME_PATH,
  saveGameToFile,
  readGameFromFile,
  fetchGameCongig,
} from './loader';
import { QspAPI, init, QspErrorData, QspListItem, QspEvents } from '@qspider/qsp-wasm';
import { SoundManager } from '@qspider/fmod';
import { prepareContent, prepareList, preparePath } from './helpers';
import { extractLayoutData, LayoutDock } from './cfg-converter';
import { DEFAULT_LAYOUT, DEFAULT_FLOATING } from './defaults';

export class GameManager {
  descriptor: GameDescriptor;
  errorData: QspErrorData;
  isInitialized = false;

  layout: LayoutDock[] = [];
  floating: [string, number, number][];

  main = '';
  stats = '';
  actions: QspListItem[] = [];
  objects: QspListItem[] = [];
  userInput = '';

  isMenuShown = false;
  menu: QspListItem[] = [];
  menuResult: (index: number) => void;

  isMsgShown = false;
  msg = '';
  onMsg: () => void;

  isInputShown = false;
  input = '';
  onInput: (text: string) => void;

  isViewShown = false;
  viewSrc = '';

  isWaiting = false;
  waitTimeout: ReturnType<typeof setTimeout>;
  onWait: () => void;

  counterDelay = 500;
  counterTimeout: ReturnType<typeof setTimeout>;

  apiInitialized: Promise<boolean>;

  isPaused = false;

  private soundManager = new SoundManager();

  constructor() {
    this.apiInitialized = new Promise((resolve) => {
      this.initialize(resolve);
    });
  }

  private api: QspAPI;

  async initialize(onApiInitialized: () => void): Promise<void> {
    this.api = await init();
    onApiInitialized();
    console.log(`QSP version: ${this.api.version()}`);
    this.setupQspCallbacks();

    const gameDescriptor = await fetchGameDescriptor();
    this.updateDescriptor(gameDescriptor);

    document.title = gameDescriptor.title;

    try {
      const gameConfig = await fetchGameCongig(gameDescriptor.folder ? `/${gameDescriptor.folder}/` : '/');
      const { layout, floating } = extractLayoutData(gameConfig);
      this.layout = layout;
      this.floating = floating;
    } catch (_) {
      this.layout = DEFAULT_LAYOUT;
      this.floating = DEFAULT_FLOATING;
    }

    this.soundManager.init(`${GAME_PATH}${gameDescriptor.folder ? `/${gameDescriptor.folder}/` : '/'}`);

    const gameSource = await fetchGameSource(
      gameDescriptor.file,
      gameDescriptor.folder ? `/${gameDescriptor.folder}/` : '/'
    );

    this.api.openGame(gameSource, gameDescriptor.file, true);
    this.api.restartGame();

    this.markInitialized();
  }

  get resourcePrefix(): string {
    return `${GAME_PATH}/${this.descriptor.folder ? this.descriptor.folder + '/' : ''}`;
  }

  setupQspCallbacks(): void {
    this.api.on('error', this.updateErrorDescription);
    this.api.on('main_changed', this.updateMain);
    this.api.on('stats_changed', this.updateStats);
    this.api.on('actions_changed', this.updateActions);
    this.api.on('objects_changed', this.updateObjects);
    this.api.on('user_input', this.updateUserInput);
    this.api.on('menu', this.updateMenu);
    this.api.on('msg', this.updateMsg);
    this.api.on('input', this.updateInput);
    this.api.on('wait', this.startWaiting);
    this.api.on('timer', this.updateTimer);
    this.api.on('view', this.updateView);
    this.api.on('open_game', this.onOpenGame);
    this.api.on('save_game', this.onSaveGame);
    this.api.on('load_save', this.onLoadSave);
    this.api.on('is_play', this.isPlay);
    this.api.on('play_file', this.playFile);
    this.api.on('close_file', this.closeFile);
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.api.on(event, listener);
  }

  execCode(code: string): void {
    console.log('EXEC: ', code);
    this.api.execCode(code);
  }

  markInitialized(): void {
    this.isInitialized = true;
  }
  updateDescriptor(descriptor: GameDescriptor): void {
    this.descriptor = descriptor;
  }
  updateErrorDescription = (errorData: QspErrorData): void => {
    this.errorData = errorData;
  };
  clearError(): void {
    this.errorData = null;
  }

  updateMain = (text: string): void => {
    this.main = prepareContent(text);
  };
  updateStats = (text: string): void => {
    this.stats = prepareContent(text);
  };
  updateActions = (list: QspListItem[]): void => {
    this.actions = prepareList(list);
  };
  updateObjects = (list: QspListItem[]): void => {
    this.objects = prepareList(list);
  };
  updateMenu = (list: QspListItem[], result: (index: number) => void): void => {
    this.menu = prepareList(list);
    this.menuResult = result;
    this.isMenuShown = true;
  };

  updateMsg = (text: string, onMsg: () => void): void => {
    this.msg = text;
    this.onMsg = onMsg;
    this.isMsgShown = true;
  };

  closeMsg = (): void => {
    this.isMsgShown = false;
    this.onMsg();
    this.msg = '';
    this.onMsg = null;
  };

  updateInput = (text: string, onInput: (text: string) => void): void => {
    this.input = text;
    this.onInput = onInput;
    this.isInputShown = true;
  };

  closeInput = (text: string): void => {
    this.isInputShown = false;
    this.onInput(text);
    this.input = '';
    this.onInput = null;
  };

  updateUserInput = (text: string): void => {
    this.userInput = text;
  };

  submitUserInput = (): void => {
    this.api.execUserInput(this.userInput);
  };

  selectAction(index: number): void {
    this.api.selectAction(index);
  }

  selectObject(index: number): void {
    this.api.selectObject(index);
  }

  selectMenu(index: number): void {
    this.isMenuShown = false;
    this.menuResult(index);
    this.menuResult = null;
  }

  startWaiting = (ms: number, onComplete: () => void): void => {
    clearTimeout(this.waitTimeout);
    this.isWaiting = true;
    this.onWait = onComplete;
    this.waitTimeout = setTimeout(() => {
      this.completeWaiting();
    }, ms);
  };

  completeWaiting = (): void => {
    clearTimeout(this.waitTimeout);
    if (this.isWaiting && this.onWait) {
      this.onWait();
      this.onWait = null;
      this.isWaiting = false;
    }
  };

  updateTimer = (ms: number): void => {
    this.counterDelay = ms;
    clearTimeout(this.counterTimeout);
    this.scheduleCounter();
  };

  scheduleCounter = (): void => {
    this.counterTimeout = setTimeout(() => {
      if (!this.isPaused && !this.isWaiting) {
        this.api.execCounter();
      }
      this.scheduleCounter();
    }, this.counterDelay);
  };

  updateView = (path: string): void => {
    if (path) {
      this.viewSrc = `${this.resourcePrefix}${preparePath(path)}`;
      this.isViewShown = true;
    } else {
      this.closeView();
    }
  };

  closeView = (): void => {
    this.isViewShown = false;
    this.viewSrc = '';
  };

  onOpenGame = async (path: string, isNewGame: boolean, onOpened: () => void): Promise<void> => {
    const gameSource = await fetchGameSource(path, this.descriptor.folder ? `/${this.descriptor.folder}/` : '/');
    this.api.openGame(gameSource, path, isNewGame);
    onOpened();
  };

  onLoadSave = async (path: string, onLoaded: () => void): Promise<void> => {
    this.isPaused = true;
    onLoaded();
    if (path) {
      const saveData = await readGameFromFile(path);
      if (saveData) {
        this.api.loadSave(saveData);
      }
    } else {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();
    }
    this.isPaused = false;
  };

  onSaveGame = async (path: string, onSaved: () => void): Promise<void> => {
    this.isPaused = true;
    const saveData = this.api.saveGame();
    if (path) {
      await saveGameToFile(path, saveData);
    } else {
      const blob = new Blob([saveData], { type: 'application/octet-stream' });
      const link = document.createElement('a');

      link.download = `${this.descriptor.title}.sav`;
      link.rel = 'noopener';

      link.href = URL.createObjectURL(blob);
      setTimeout(function () {
        URL.revokeObjectURL(link.href);
      }, 4e4); // 40s
      setTimeout(function () {
        link.dispatchEvent(new MouseEvent('click'));
      }, 0);
    }
    onSaved();
    this.isPaused = false;
  };

  isPlay = (file: string, onResult: (result: boolean) => void): void => {
    const isPlay = this.soundManager.isPlaying(file);
    onResult(isPlay);
  };

  closeFile = (file: string, onReady: () => void): void => {
    try {
      this.soundManager.closeFile(file);
    } catch (e) {
      console.error(e);
    }
    onReady();
  };

  playFile = async (file: string, volume: number, onReady: () => void): Promise<void> => {
    try {
      await this.soundManager.playFile(file, volume);
    } catch (e) {
      console.error(e);
    }
    onReady();
  };
}

decorate(GameManager, {
  descriptor: observable,
  isInitialized: observable,

  main: observable,
  stats: observable,
  actions: observable.ref,
  objects: observable.ref,
  userInput: observable,

  isMenuShown: observable,
  menu: observable.ref,
  updateMsg: action,
  closeMsg: action,

  isMsgShown: observable,
  msg: observable,

  isInputShown: observable,
  input: observable,

  isViewShown: observable,
  viewSrc: observable,
  updateView: action,
  closeView: action,

  isWaiting: observable,
  startWaiting: action,
  completeWaiting: action,

  markInitialized: action,
  updateDescriptor: action,
  updateErrorDescription: action,
  clearError: action,

  updateMain: action,
  updateStats: action,
  updateActions: action,
  updateObjects: action,
  updateUserInput: action,
  updateMenu: action,
  selectMenu: action,
});

function createGameManager() {
  return new GameManager();
}

const gameManagerContext = React.createContext<GameManager | null>(null);

export const GameManagerProvider: React.FC = ({ children }) => {
  const store = useLocalStore(createGameManager);
  return <gameManagerContext.Provider value={store}>{children}</gameManagerContext.Provider>;
};

export const useGameManager = (): GameManager => {
  const manager = React.useContext(gameManagerContext);
  if (!manager) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return manager;
};
