import { CatalogGame, moveToShelf } from '@qspider/game-state';
import { Cross1Icon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { DateTime } from 'luxon';
import { ContentRenderer } from './content-renderer';
import { formatBytes } from './formatters';

export const CatalogGameCard: React.FC<{ game: CatalogGame }> = ({ game }) => {
  const icon = game.icon ? game.icon.substring(game.icon.lastIndexOf('com_sobi2')) : null;
  return (
    <Popover.Root>
      <div className="q-catalog__card">
        <h5 className="q-title">
          {game.icon && <img alt="" src={'https://qsp.su/gamestock/image.php?name=' + icon} loading="lazy" />}
          {game.title}
        </h5>

        <div className="q-catalog__card-details">
          <div>
            <div className="q-catalog__card-details-row">Author: {game.author}</div>
            {game.ported_by && <div className="q-catalog__card-details-row">Ported by: {game.ported_by}</div>}
            <div className="q-catalog__card-details-row">Version: {game.version}</div>
          </div>
          <div>
            <div className="q-catalog__card-details-row">Size: {formatBytes(game.file_size)}</div>
            <div className="q-catalog__card-details-row">Type: {game.file_ext}</div>
            <div className="q-catalog__card-details-row">
              Last update: {DateTime.fromMillis(game.mod_date).toLocaleString(DateTime.DATETIME_FULL)}
            </div>
          </div>
        </div>
        <div className="q-catalog__card-buttons">
          <Popover.Trigger asChild>
            <button className="q-ghost-button">Read Description</button>
          </Popover.Trigger>
          <button className="q-button" onClick={(): Promise<void> => moveToShelf(game)}>
            Add to shelf
          </button>
        </div>
        <Popover.Portal>
          <Popover.Content className="q-popover-content" sideOffset={5}>
            <ContentRenderer content={game.description} />
            <Popover.Close className="q-ghost-button q-popover-close" aria-label="Close">
              <Cross1Icon />
            </Popover.Close>
            <Popover.Arrow className="q-popover-arrow" />
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
};
