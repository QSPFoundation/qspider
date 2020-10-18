import React from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from './game/manager';
import { LoadingScreen } from './components/loading-screen';
import { GameListDialog } from './components/dialogs/game-list/game-list.dialog';

export const Game: React.FC = observer(({ children }) => {
  const manager = useGameManager();
  if (!manager.isInitialized) return <LoadingScreen />;
  if (manager.currentGame) return <>{children}</>;
  return (
    <>
      <LoadingScreen />;
      <GameListDialog closable={false} />
    </>
  );
});
