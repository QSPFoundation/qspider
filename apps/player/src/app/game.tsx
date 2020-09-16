import React from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from './game/manager';
import { LoadingScreen } from './components/loading-screen';

export const Game: React.FC = observer(({ children }) => {
  const manager = useGameManager();
  return manager.isInitialized ? <>{children}</> : <LoadingScreen />;
});
