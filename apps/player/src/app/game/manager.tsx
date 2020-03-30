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
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]) {
    this.api.on(event, listener);
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

  selectAction(index: number) {
    this.api.selectAction(index);
  }

  selectObject(index: number) {
    this.api.selectObject(index);
  }
}

decorate(GameManager, {
  descriptor: observable,
  isInitialized: observable,

  main: observable,
  stats: observable,
  actions: observable.ref,
  objects: observable.ref,

  markInitialized: action,
  updateDescriptor: action,
  updateErrorDescription: action,
  clearError: action,

  updateMain: action,
  updateStats: action,
  updateActions: action,
  updateObjects: action,
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
