import { CatalogGame, moveToShelf } from '@qspider/game-state';
import { DateTime } from 'luxon';
import { ContentRenderer } from './content-renderer';
import { formatBytes } from './formatters';

export const CatalogGameCard: React.FC<{ game: CatalogGame }> = ({ game }) => {
  const icon = game.icon ? game.icon.substring(game.icon.lastIndexOf('com_sobi2')) : null;
  return (
    <div>
      <h5>{game.title}</h5>
      <button className="q-button" onClick={(): Promise<void> => moveToShelf(game)}>
        Add to shelf
      </button>
      <div>Author: {game.author}</div>
      {game.ported_by && <div>Ported by: {game.ported_by}</div>}
      <div>Version: {game.version}</div>
      {game.icon && (
        <div>
          <img alt="" src={'https://qsp.su/gamestock/image.php?name=' + icon} loading="lazy" />
        </div>
      )}
      <div>Size: {formatBytes(game.file_size)}</div>
      <div>Type: {game.file_ext}</div>
      <div>Last update: {DateTime.fromMillis(game.mod_date).toLocaleString(DateTime.DATETIME_FULL)}</div>
      <ContentRenderer content={game.description} />
    </div>
  );
};
