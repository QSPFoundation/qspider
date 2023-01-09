import { gamesList$, showCatalog$ } from '@qspider/game-state';
import { useComponents } from '@qspider/providers';
import { useAtom } from '@xoid/react';
import { GameCard } from './game-card';
import { QspCatalog } from './qsp-catalog';

export const GameShelf: React.FC = () => {
  const games = useAtom(gamesList$);
  const { OpenGameButton } = useComponents();
  const isCatalogShown = useAtom(showCatalog$);
  if (isCatalogShown) return <QspCatalog />;
  return (
    <div className="game-shelf">
      <div>
        <OpenGameButton />{' '}
        <button
          className="q-button"
          onClick={(): void => {
            showCatalog$.set(true);
          }}
        >
          Qsp Game Catalog
        </button>
      </div>
      <div className="game-shelf__list">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
