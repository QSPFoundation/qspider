import { IGameManager } from '@qspider/contracts';
import React from 'react';

const gameManagerContext = React.createContext<IGameManager | null>(null);

export const GameManagerProvider = gameManagerContext.Provider;

export const useGameManager = (): IGameManager => {
  const manager = React.useContext(gameManagerContext);
  if (!manager) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return manager;
};
