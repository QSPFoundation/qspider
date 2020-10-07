import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action } from 'mobx';
import { fetchGameDescriptor, GameDescriptor, fetchGameSource, GAME_PATH, fetchGameCongig } from './loader';
import { QspAPI, init, QspErrorData, QspListItem, QspEvents } from '@qspider/qsp-wasm';
import { prepareContent, prepareList, preparePath } from './helpers';
import { extractLayoutData, LayoutDock } from './cfg-converter';
import { DEFAULT_LAYOUT, DEFAULT_FLOATING } from './defaults';
import { SaveManager, SaveAction } from './save-manager';
import { QspGUIPanel } from '../constants';
import { CfgData } from './cfg-parser';
import { AudioEngine } from './audio-engine';

export class GameManager {
  descriptor: GameDescriptor;
  folder: string;
  config: CfgData;
  errorData: QspErrorData;
  isInitialized = false;

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

  constructor() {
    this.apiInitialized = new Promise((resolve) => {
      this.initialize(resolve);
    });
  }

  private api: QspAPI;

  async initialize(onApiInitialized: () => void): Promise<void> {
    this.api = await init();
    console.log(`QSP version: ${this.api.version()}`);

    this.setupQspCallbacks();

    const gameDescriptor = await fetchGameDescriptor();
    this.updateDescriptor(gameDescriptor);

    document.title = gameDescriptor.title;

    try {
      const gameConfig = await fetchGameCongig();
      const { layout, floating } = extractLayoutData(gameConfig);
      this.config = gameConfig;
      this.layout = layout;
      this.floating = floating;
    } catch (_) {
      this.layout = DEFAULT_LAYOUT;
      this.floating = DEFAULT_FLOATING;
    }

    onApiInitialized();

    const gameSource = await fetchGameSource(gameDescriptor.file, this.basePath);

    this.api.openGame(gameSource, true);
    this.api.restartGame();

    this.markInitialized();
  }

  get resourcePrefix(): string {
    return this.basePath;
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
  updateDescriptor(descriptor: GameDescriptor): void {
    this.descriptor = descriptor;
    if (descriptor.folder) {
      this.basePath = `${GAME_PATH}/${descriptor.folder}/`;
    }
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
    clearTimeout(this.counterTimeout);
  }

  resume(): void {
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

  onOpenGame = async (path: string, isNewGame: boolean, onOpened: () => void): Promise<void> => {
    this.pause();
    const gameSource = await fetchGameSource(path, this.descriptor.folder ? `/${this.descriptor.folder}/` : '/');
    this.api.openGame(gameSource, isNewGame);
    onOpened();
    this.resume();
  };

  onLoadSave = async (path: string, onLoaded: () => void): Promise<void> => {
    if (path) {
      this.pause();
      onLoaded();
      const saveData = await this.saveManager.loadByPath(this.descriptor.id, path);
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
      await this.saveManager.saveByPath(this.descriptor.id, path, saveData);
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
      const slots = await this.saveManager.getSlots(this.descriptor.id);
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
      await this.saveManager.updateSlot(this.descriptor.id, slot, this.saveAction.data);
    }
    this.clearSaveAction();
  };

  requestRestore = async (onResult?: () => void): Promise<void> => {
    this.pause();
    const slots = await this.saveManager.getSlots(this.descriptor.id);
    this.saveAction = {
      type: 'restore',
      slots,
      callback: this.restoreFromSlot,
      onResult,
    };
  };

  restoreFromSlot = async (slot: number): Promise<void> => {
    const saveData = await this.saveManager.getSlotData(this.descriptor.id, slot);
    if (this.saveAction.onResult) {
      this.saveAction.onResult();
    }
    this.saveAction.onResult = null;
    if (saveData) {
      this.api.loadSave(saveData);
    }
    this.clearSaveAction();
  };

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

  saveAction: observable.ref,
  clearSaveAction: action,
  requestSave: action,
  requestRestore: action,

  markInitialized: action,
  updateDescriptor: action,

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
