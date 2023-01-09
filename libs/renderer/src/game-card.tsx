import { GameDescriptor } from '@qspider/contracts';
import { games$ } from '@qspider/game-state';
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
      <h3 className="game-shelf__card-title">{game.title}</h3>
      {game.description && (
        <div>
          <ContentRenderer content={game.description} />
        </div>
      )}
      <Link to={`/game/${game.id}`}>Run</Link>
      <button type="button" className="q-button q-danger" onClick={removeGame}>
        Remove from shelf
      </button>
    </div>
  );
};
