import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action } from 'mobx';
import { fetchGameDescriptor, GameDescriptor, fetchGameSource } from './loader';
import {
  QspAPI,
  init,
  QspErrorData,
  QspListItem,
  QspEvents,
} from '@qspider/qsp-wasm';

export class GameManager {
  descriptor: GameDescriptor;
  errorData: QspErrorData;
  isInitialized = false;

  main = '';
  stats = '';
  actions: QspListItem[] = [];
  objects: QspListItem[] = [];

  isMenuShown = false;
  menu: QspListItem[] = [];
  menuResult: (index: number) => void;

  isMsgShown = false;
  msg = '';
  onMsg: () => void;

  isInputShown = false;
  input = '';
  onInput: (text: string) => void;

  isWaiting = false;
  waitTimeout: ReturnType<typeof setTimeout>;
  onWait: () => void;

  counterDelay = 500;
  counterTimeout: ReturnType<typeof setTimeout>;

  apiInitialized: Promise<boolean>;

  constructor() {
    this.apiInitialized = new Promise((resolve) => {
      this.initialize(resolve);
    });
  }

  private api: QspAPI;

  async initialize(onApiInitialized: () => void) {
    this.api = await init();
    onApiInitialized();
    console.log(`QSP version: ${this.api.version()}`);
    this.setupQspCallbacks();

    const gameDescriptor = await fetchGameDescriptor();
    this.updateDescriptor(gameDescriptor);
    document.title = gameDescriptor.title;

    const gameSource = await fetchGameSource(gameDescriptor.file);

    this.api.createGameWorld(gameSource, gameDescriptor.file);
    this.api.restartGame();

    this.markInitialized();
  }

  setupQspCallbacks() {
    this.api.on('error', this.updateErrorDescription);
    this.api.on('main_changed', this.updateMain);
    this.api.on('stats_changed', this.updateStats);
    this.api.on('actions_changed', this.updateActions);
    this.api.on('objects_changed', this.updateObjects);
    this.api.on('menu', this.updateMenu);
    this.api.on('msg', this.updateMsg);
    this.api.on('input', this.updateInput);
    this.api.on('wait', this.startWaiting);
    this.api.on('timer', this.updateTimer);
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]) {
    this.api.on(event, listener);
  }

  execCode(code: string) {
    console.log('EXEC: ', code);
    this.api.execCode(code);
  }

  markInitialized() {
    this.isInitialized = true;
  }
  updateDescriptor(descriptor: GameDescriptor) {
    this.descriptor = descriptor;
  }
  updateErrorDescription = (errorData: QspErrorData) => {
    this.errorData = errorData;
  };
  clearError() {
    this.errorData = null;
  }

  updateMain = (text: string) => {
    this.main = text;
  };
  updateStats = (text: string) => {
    this.stats = text;
  };
  updateActions = (list: QspListItem[]) => {
    this.actions = list;
  };
  updateObjects = (list: QspListItem[]) => {
    this.objects = list;
  };
  updateMenu = (list: QspListItem[], result: (index: number) => void) => {
    this.menu = list;
    this.menuResult = result;
    this.isMenuShown = true;
  };

  updateMsg = (text: string, onMsg: () => void) => {
    this.msg = text;
    this.onMsg = onMsg;
    this.isMsgShown = true;
  };

  closeMsg = () => {
    this.isMenuShown = false;
    this.onMsg();
    this.msg = '';
    this.onMsg = null;
  };

  updateInput = (text: string, onInput: (text: string) => void) => {
    this.input = text;
    this.onInput = onInput;
    this.isInputShown = true;
  };

  closeInput = (text: string) => {
    this.isInputShown = false;
    this.onInput(text);
    this.input = '';
    this.onInput = null;
  };

  selectAction(index: number) {
    this.api.selectAction(index);
  }

  selectObject(index: number) {
    this.api.selectObject(index);
  }

  selectMenu(index: number) {
    this.menuResult(index);
    this.menuResult = null;
    this.isMenuShown = false;
  }

  startWaiting = (ms: number, onComplete: () => void) => {
    this.isWaiting = true;
    this.onWait = onComplete;
    clearTimeout(this.waitTimeout);
    this.waitTimeout = setTimeout(() => this.completeWaiting(), ms);
  };

  completeWaiting = () => {
    clearTimeout(this.waitTimeout);
    this.isWaiting = false;
    this.onWait();
    this.onWait = null;
  };

  updateTimer = (ms: number) => {
    this.counterDelay = ms;
    clearTimeout(this.counterTimeout);
    this.scheduleCounter();
  };

  scheduleCounter = () => {
    this.counterTimeout = setTimeout(() => {
      console.log('counter');
      this.api.execCounter();
      this.scheduleCounter();
    }, this.counterDelay);
  };
}

decorate(GameManager, {
  descriptor: observable,
  isInitialized: observable,

  main: observable,
  stats: observable,
  actions: observable.ref,
  objects: observable.ref,

  isMenuShown: observable,
  menu: observable.ref,
  updateMsg: action,
  closeMsg: action,

  isMsgShown: observable,
  msg: observable,

  isInputShown: observable,
  input: observable,

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
  updateMenu: action,
  selectMenu: action,
});

function createGameManager() {
  return new GameManager();
}

const gameManagerContext = React.createContext<GameManager | null>(null);

export const GameManagerProvider = ({ children }) => {
  const store = useLocalStore(createGameManager);
  return (
    <gameManagerContext.Provider value={store}>
      {children}
    </gameManagerContext.Provider>
  );
};

export const useGameManager = () => {
  const manager = React.useContext(gameManagerContext);
  if (!manager) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return manager;
};
