import React, { ReactElement } from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from './game/manager';
import { LoadingScreen } from './components/loading-screen';
import { GameListDialog } from './components/dialogs/game-list/game-list.dialog';

export const Game: React.FC = observer(({ children }): ReactElement => {
  const manager = useGameManager();
  if (!manager.isInitialized) return <LoadingScreen />;
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (manager.currentGame) return <>{children}</>;
  return (
    <>
      <LoadingScreen />;
      <GameListDialog closable={false} />
    </>
  );
});
