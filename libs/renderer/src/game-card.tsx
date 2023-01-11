import { GameDescriptor } from '@qspider/contracts';
import { games$ } from '@qspider/game-state';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { use } from 'xoid';
import { ContentRenderer } from './content-renderer';

export const GameCard: React.FC<{ game: GameDescriptor }> = ({ game }) => {
  const removeGame = useCallback(() => {
    use(games$).remove(game.id);
  }, [game.id]);
  return (
    <div className="game-shelf__card">
      <div className="game-shelf__card-content">
        <button
          type="button"
          className="q-ghost-button q-remove-game-button"
          title="Remove from Game Shelf"
          onClick={removeGame}
        >
          <Cross1Icon />
        </button>
        <h3 className="game-shelf__card-title">{game.title}</h3>
        {game.description && (
          <div>
            <ContentRenderer content={game.description} />
          </div>
        )}
      </div>
      <div className="game-shelf__card-actions">
        <Link to={`/game/${game.id}`}>Run</Link>
      </div>
    </div>
  );
};
