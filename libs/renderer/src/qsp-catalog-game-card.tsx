import { CatalogGame, moveToShelf } from '@qspider/game-state';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { ContentRenderer } from './content-renderer';
import { formatBytes } from './formatters';

export const CatalogGameCard: React.FC<{ game: CatalogGame }> = ({ game }) => {
  const [isDescriptionShown, setIsDescriptionShown] = useState(false);
  const icon = game.icon ? game.icon.substring(game.icon.lastIndexOf('com_sobi2')) : null;
  return (
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
        <button className="q-ghost-button" onClick={(): void => setIsDescriptionShown(!isDescriptionShown)}>
          {isDescriptionShown ? (
            <>
              Hide Description <ChevronUpIcon />
            </>
          ) : (
            <>
              Show Description <ChevronDownIcon />
            </>
          )}
        </button>
        <button className="q-button" onClick={(): Promise<void> => moveToShelf(game)}>
          Add to shelf
        </button>
      </div>
      {isDescriptionShown && (
        <div className="q-catalog__card-description">
          <ContentRenderer content={game.description} />
        </div>
      )}
    </div>
  );
};
