import { GameDescriptor } from '@qspider/contracts';
import { games$, runGame } from '@qspider/game-state';
import { useCallback } from 'react';
import { use } from 'xoid';

export const GameCard: React.FC<{ game: GameDescriptor }> = ({ game }) => {
  const onRunGame = useCallback(async () => {
    try {
      await runGame(game.id);
    } catch {
      // TODO show error
    }
  }, [game.id]);
  const removeGame = useCallback(() => {
    use(games$).remove(game.id);
  }, [game.id]);
  return (
    <div className="game-shelf__card">
      <h3 className="game-shelf__card-title">{game.title}</h3>
      {game.description && <p>{game.description}</p>}
      <button type="button" onClick={onRunGame}>
        Run
      </button>
      <button type="button" onClick={removeGame}>
        Remove from shelf
      </button>
    </div>
  );
};
