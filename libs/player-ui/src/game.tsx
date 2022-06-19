import React, { ReactElement } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '@qspider/providers';
import { LoadingScreen } from './loading-screen';
import { GameListDialog } from './game-list';

export const Game: React.FC<{ children: React.ReactNode }> = observer(({ children }): ReactElement => {
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
