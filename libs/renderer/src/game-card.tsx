import { GameDescriptor } from '@qspider/contracts';
import { games$, runGame, showError } from '@qspider/game-state';
import { useCallback } from 'react';
import { use } from 'xoid';
import { ContentRenderer } from './content-renderer';

export const GameCard: React.FC<{ game: GameDescriptor }> = ({ game }) => {
  const onRunGame = useCallback(async () => {
    try {
      await runGame(game.id);
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
    }
  }, [game.id]);
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
      <button type="button" className="q-button" onClick={onRunGame}>
        Run
      </button>
      <button type="button" className="q-button q-danger" onClick={removeGame}>
        Remove from shelf
      </button>
    </div>
  );
};
