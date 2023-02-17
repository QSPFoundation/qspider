import { useAtom } from '@xoid/react';
import { gamesList$ } from '../game-shelf';
import { GameCard } from './game-card';

export const GameShelf: React.FC = () => {
  const games = useAtom(gamesList$);
  return (
    <div className="game-shelf">
      <div className="game-shelf__list">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
