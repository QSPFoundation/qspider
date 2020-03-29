import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action } from 'mobx';
import { fetchGameDescriptor, GameDescriptor, fetchGameSource } from './loader';
import { QspAPI, init, QspErrorData } from '@qspider/qsp-wasm';

class GameManager {
  descriptor: GameDescriptor;
  errorData: QspErrorData;
  isInitialized = false;

  private api: QspAPI;

  async initialize() {
    this.api = await init();
    console.log(`QSP version: ${this.api.version()}`);

    const gameDescriptor = await fetchGameDescriptor();
    this.updateDescriptor(gameDescriptor);
    document.title = gameDescriptor.title;

    const gameSource = await fetchGameSource(gameDescriptor.file);

    this.api.createGameWorld(gameSource, gameDescriptor.file);

    this.markInitialized();
  }

  setupQspCallbacks() {
    this.api.on('error', this.updateErrorDescription);
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
}

decorate(GameManager, {
  descriptor: observable,
  isInitialized: observable,

  markInitialized: action,
  updateDescriptor: action,
  updateErrorDescription: action,
});

function createGameManager() {
  const manager = new GameManager();
  manager.initialize();
  return manager;
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
