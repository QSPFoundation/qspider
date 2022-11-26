import { currentGame$, stopCurrentGame } from '@qspider/game-state';
import { useAtom } from '@xoid/react';

export const GameRunner: React.FC = () => {
  const currentGame = useAtom(currentGame$);
  return (
    <div>
      Runnign {currentGame?.title}
      <button onClick={stopCurrentGame}>Stop</button>
    </div>
  );
};
