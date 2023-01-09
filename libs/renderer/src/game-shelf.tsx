import { gamesList$ } from '@qspider/game-state';
import { useComponents } from '@qspider/providers';
import { useAtom } from '@xoid/react';
import { Link } from 'react-router-dom';
import { GameCard } from './game-card';

export const GameShelf: React.FC = () => {
  const games = useAtom(gamesList$);
  const { OpenGameButton } = useComponents();
  return (
    <div className="game-shelf">
      <div>
        <OpenGameButton /> <Link to="catalog">Qsp Game Catalog</Link>
      </div>
      <div className="game-shelf__list">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
