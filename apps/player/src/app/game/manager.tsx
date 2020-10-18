import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action } from 'mobx';
import { fetchPlayerConfig, GameDescriptor, fetchGameSource, GAME_PATH, fetchGameConfig, PlayerConfig } from './loader';
import { QspAPI, init, QspErrorData, QspListItem, QspEvents } from '@qspider/qsp-wasm';
import { prepareContent, prepareList, preparePath } from './helpers';
import { extractLayoutData, LayoutDock } from './cfg-converter';
import { DEFAULT_LAYOUT, DEFAULT_FLOATING } from './defaults';
import { SaveManager, SaveAction } from './save-manager';
import { QspGUIPanel } from '../constants';
import { CfgData } from './cfg-parser';
import { AudioEngine } from './audio-engine';
import { HotKeysManager } from './hotkeys';

const isExternalSource = (path: string) => path.startsWith('http://') || path.startsWith('https://');

export class GameManager {
  config: PlayerConfig;
  currentGame: GameDescriptor;
  folder: string;
  gameConfig: CfgData;
  errorData: QspErrorData;
  isInitialized = false;
  isGameListShown = false;

  layout: LayoutDock[] = [];
  floating: [QspGUIPanel, number, number][];

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

  saveAction: SaveAction | null = null;

  counterDelay = 500;
  counterTimeout: ReturnType<typeof setTimeout>;

  apiInitialized: Promise<boolean>;

  private basePath = `${GAME_PATH}/`;
  public readonly audioEngine = new AudioEngine();
  private saveManager = new SaveManager();
  private hotKeysManager = new HotKeysManager();

  constructor() {
    this.apiInitialized = new Promise((resolve) => {
      this.initialize(resolve);
    });
  }

  private isPaused: boolean = false;
  private api: QspAPI;

  async initialize(onApiInitialized: () => void): Promise<void> {
    this.api = await init();
    console.log(`QSP version: ${this.api.version()}`);

    this.setupQspCallbacks();
    this.setuphotKeyListeners();

    this.config = await fetchPlayerConfig();
    console.log(this.config);

    this.hotKeysManager.setupGlobalHotKeys();
    onApiInitialized();

    if (this.config.game.length > 1) {
      this.showGameList();
    } else {
      this.runGame(this.config.game[0]);
    }

    this.markInitialized();
  }

  async runGame(descriptor: GameDescriptor) {
    if (this.isGameListShown) {
      this.hideGameList();
    }
    if (this.currentGame) {
      this.hotKeysManager.reset();
    }
    this.basePath = `${GAME_PATH}/`;
    const { file, title } = descriptor;
    document.title = title;
    const path = isExternalSource(file) ? file : this.preparePath(file);
    const gameSource = await fetchGameSource(path);
    this.updateBasePath(path);

    try {
      const gameConfig = await fetchGameConfig(this.basePath);
      const { layout, floating } = extractLayoutData(gameConfig);
      this.gameConfig = gameConfig;
      this.layout = layout;
      this.floating = floating;
    } catch (_) {
      this.layout = DEFAULT_LAYOUT;
      this.floating = DEFAULT_FLOATING;
    }

    this.currentGame = descriptor;

    if (descriptor.hotkeys) {
      this.hotKeysManager.setupCustomHotKeys(descriptor.hotkeys);
    }

    this.api.openGame(gameSource, true);
    this.api.restartGame();
  }

  updateBasePath(path: string) {
    this.basePath = path.slice(0, path.lastIndexOf('/') + 1);
  }

  get resourcePrefix(): string {
    return this.basePath;
  }

  get hasGameList(): boolean {
    return this.config.game.length > 0;
  }

  showGameList() {
    this.isGameListShown = true;
  }

  hideGameList() {
    this.isGameListShown = false;
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

  setuphotKeyListeners() {
    this.hotKeysManager.on('select_action', (index: number) => {
      if (this.isPaused) return;
      if (index >= 0 && index < this.actions.length) {
        this.selectAction(index);
      }
    });
    this.hotKeysManager.on('select_single_action', () => {
      if (this.isPaused) return;
      if (this.actions.length === 1) {
        this.selectAction(0);
      }
    });
    this.hotKeysManager.on('save', () => {
      if (this.isPaused) return;
      this.requestSave();
    });
    this.hotKeysManager.on('load', () => {
      if (this.isPaused) return;
      this.requestRestore();
    });
    this.hotKeysManager.on('restart', () => {
      if (this.isPaused) return;
      this.restart();
    });
    this.hotKeysManager.on('quicksave', () => {
      if (this.isPaused) return;
      this.quickSave();
    });
    this.hotKeysManager.on('quickload', () => {
      if (this.isPaused) return;
      this.quickLoad();
    });
    this.hotKeysManager.on('volume_up', () => {
      if (this.isPaused) return;
      this.audioEngine.increaseVolume();
    });
    this.hotKeysManager.on('volume_down', () => {
      if (this.isPaused) return;
      this.audioEngine.decreaseVolume();
    });
    this.hotKeysManager.on('unmute', () => {
      if (this.isPaused) return;
      this.audioEngine.unMute();
    });
    this.hotKeysManager.on('mute', () => {
      if (this.isPaused) return;
      this.audioEngine.mute();
    });
    this.hotKeysManager.on('exec_loc', (name) => {
      if (this.isPaused) return;
      this.api.execLoc(name);
    });
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    this.api.on(event, listener);
  }

  restart(): void {
    this.pause();
    this.api.restartGame();
  }

  execCode(code: string): void {
    console.log('EXEC: ', code);
    this.api.execCode(code);
  }

  markInitialized(): void {
    this.isInitialized = true;
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
    this.pause();
    this.menu = prepareList(list);
    this.menuResult = result;
    this.isMenuShown = true;
  };

  updateMsg = (text: string, onMsg: () => void): void => {
    this.pause();
    this.msg = text;
    this.onMsg = onMsg;
    this.isMsgShown = true;
  };

  closeMsg = (): void => {
    this.isMsgShown = false;
    const onMsg = this.onMsg;
    this.msg = '';
    this.onMsg = null;
    this.resume();
    onMsg();
  };

  updateInput = (text: string, onInput: (text: string) => void): void => {
    this.pause();
    this.input = text;
    this.onInput = onInput;
    this.isInputShown = true;
  };

  closeInput = (text: string): void => {
    this.isInputShown = false;
    const onInput = this.onInput;
    this.input = '';
    this.onInput = null;
    this.resume();
    onInput(text);
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
    const menuResult = this.menuResult;
    this.isMenuShown = false;
    this.menuResult = null;
    this.resume();
    menuResult(index);
  }

  startWaiting = (ms: number, onComplete: () => void): void => {
    this.pause();
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
      const onWait = this.onWait;
      this.onWait = null;
      this.isWaiting = false;
      this.resume();
      onWait();
    }
  };

  updateTimer = (ms: number): void => {
    this.counterDelay = ms;
    clearTimeout(this.counterTimeout);
    this.scheduleCounter();
  };

  scheduleCounter = (): void => {
    this.counterTimeout = setTimeout(() => {
      this.api.execCounter();
      this.scheduleCounter();
    }, this.counterDelay);
  };

  pause(): void {
    this.isPaused = true;
    clearTimeout(this.counterTimeout);
  }

  resume(): void {
    this.isPaused = false;
    this.scheduleCounter();
  }

  updateView = (path: string): void => {
    if (path) {
      this.viewSrc = this.preparePath(path);
      this.isViewShown = true;
    } else {
      this.closeView();
    }
  };

  closeView = (): void => {
    this.isViewShown = false;
    this.viewSrc = '';
  };

  onOpenGame = async (file: string, isNewGame: boolean, onOpened: () => void): Promise<void> => {
    this.pause();
    const path = this.preparePath(file);
    const gameSource = await fetchGameSource(path);
    this.api.openGame(gameSource, isNewGame);
    this.updateBasePath(path);
    onOpened();
    this.resume();
  };

  onLoadSave = async (path: string, onLoaded: () => void): Promise<void> => {
    if (path) {
      this.pause();
      onLoaded();
      const saveData = await this.saveManager.loadByPath(this.currentGame.id, path);
      if (saveData) {
        this.api.loadSave(saveData);
      }
      this.resume();
    } else {
      this.requestRestore(onLoaded);
    }
  };

  onSaveGame = async (path: string, onSaved: () => void): Promise<void> => {
    if (path) {
      this.pause();
      const saveData = this.api.saveGame();
      await this.saveManager.saveByPath(this.currentGame.id, path, saveData);
      this.resume();
      onSaved();
    } else {
      this.requestSave(onSaved);
    }
  };

  isPlay = (path: string, onResult: (result: boolean) => void): void => {
    const isPlay = this.audioEngine.isPlaying(this.preparePath(path));
    onResult(isPlay);
  };

  closeFile = (path: string, onReady: () => void): void => {
    if (path) {
      this.audioEngine.close(this.preparePath(path));
    } else {
      this.audioEngine.closeAll();
    }
    onReady();
  };

  playFile = async (path: string, volume: number, onReady: () => void): Promise<void> => {
    this.audioEngine.play(this.preparePath(path), volume);
    onReady();
  };

  requestSave = async (onResult?: () => void): Promise<void> => {
    this.pause();
    const saveData = this.api.saveGame();
    if (saveData) {
      const slots = await this.saveManager.getSlots(this.currentGame.id);
      this.saveAction = {
        type: 'save',
        slots,
        data: saveData,
        callback: this.saveToSlot,
        onResult,
      };
    }
  };
  saveToSlot = async (slot: number): Promise<void> => {
    if (this.saveAction.type === 'save') {
      await this.saveManager.updateSlot(this.currentGame.id, slot, this.saveAction.data);
    }
    this.clearSaveAction();
  };

  async quickSave() {
    this.pause();
    const saveData = this.api.saveGame();
    await this.saveManager.quickSave(this.currentGame.id, saveData);
    this.resume();
  }

  requestRestore = async (onResult?: () => void): Promise<void> => {
    this.pause();
    const slots = await this.saveManager.getSlots(this.currentGame.id);
    this.saveAction = {
      type: 'restore',
      slots,
      callback: this.restoreFromSlot,
      onResult,
    };
  };

  restoreFromSlot = async (slot: number): Promise<void> => {
    const saveData = await this.saveManager.getSlotData(this.currentGame.id, slot);
    if (this.saveAction.onResult) {
      this.saveAction.onResult();
    }
    this.saveAction.onResult = null;
    if (saveData) {
      this.api.loadSave(saveData);
    }
    this.clearSaveAction();
  };

  async quickLoad() {
    this.pause();
    const saveData = await this.saveManager.quickLoad(this.currentGame.id);
    if (saveData) {
      this.api.loadSave(saveData);
    }
    this.resume();
  }

  clearSaveAction = (): void => {
    if (this.saveAction.onResult) {
      this.saveAction.onResult();
    }
    this.saveAction = null;
    this.resume();
  };

  private preparePath(path: string): string {
    return `${this.resourcePrefix}${preparePath(path)}`;
  }
}

decorate(GameManager, {
  isInitialized: observable,
  isGameListShown: observable,
  currentGame: observable,

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

  saveAction: observable.ref,
  clearSaveAction: action,
  requestSave: action,
  requestRestore: action,

  markInitialized: action,
  showGameList: action,
  hideGameList: action,

  errorData: observable,
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
