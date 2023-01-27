import { GameDescriptor } from '@qspider/contracts';
import { games$ } from '@qspider/game-state';
import { Cross1Icon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { use } from 'xoid';
import { ContentRenderer } from './content-renderer';

export const GameCard: React.FC<{ game: GameDescriptor }> = ({ game }) => {
  const removeGame = useCallback(() => {
    use(games$).remove(game.id);
  }, [game.id]);
  return (
    <Popover.Root>
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
        </div>
        <div className="game-shelf__card-actions">
          {game.description ? (
            <Popover.Trigger asChild>
              <button className="q-ghost-button">Read Description</button>
            </Popover.Trigger>
          ) : (
            <div></div>
          )}
          <Link to={`/game/${game.id}`}>Run</Link>
        </div>
        {game.description && (
          <Popover.Portal>
            <Popover.Content className="q-popover-content" sideOffset={5}>
              <ContentRenderer content={game.description} />
              <Popover.Close className="q-ghost-button q-popover-close" aria-label="Close">
                <Cross1Icon />
              </Popover.Close>
              <Popover.Arrow className="q-popover-arrow" />
            </Popover.Content>
          </Popover.Portal>
        )}
      </div>
    </Popover.Root>
  );
};
