import { currentGame$, stopCurrentGame } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { QspErrorAlert } from './qsp-error-alert';
import { QspPlayer } from './theme-core';
import { WaitLock } from './wait-lock';

export const GameRunner: React.FC = () => {
  const currentGame = useAtom(currentGame$);
  return (
    <div>
      Runnign {currentGame?.title}
      <button onClick={stopCurrentGame}>Stop</button>
      <QspPlayer />
      <WaitLock />
      <QspErrorAlert />
    </div>
  );
};
