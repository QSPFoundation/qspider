import { currentGame$, isPauseScreenVisible$, stopCurrentGame } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { QspErrorAlert } from './qsp-error-alert';
import { QspPlayer } from './theme-core';
import { QspPauseScreen } from './theme-core/pause-screen/pause-screen';
import { WaitLock } from './wait-lock';

export const GameRunner: React.FC = () => {
  const currentGame = useAtom(currentGame$);
  return (
    <div>
      Runnign {currentGame?.title}
      <button onClick={(): void => isPauseScreenVisible$.set(true)}>Pause</button>
      <button onClick={stopCurrentGame}>Stop</button>
      <QspPlayer />
      <WaitLock />
      <QspPauseScreen />
      <QspErrorAlert />
    </div>
  );
};
