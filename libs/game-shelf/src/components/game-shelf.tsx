import { useAtom } from '@xoid/react';
import { useEffect } from 'react';
import { gamesList$, pendingWrites$ } from '../game-shelf';
import { checkForUpdates } from '../qsp-catalog';
import { GameCard } from './game-card';
import { useTranslation } from 'react-i18next';

export const GameShelf: React.FC = () => {
  const games = useAtom(gamesList$);
  const pendingWrites = useAtom(pendingWrites$);
  const { t } = useTranslation();

  useEffect(() => {
    checkForUpdates();
  }, []);
  return (
    <div className="game-shelf" data-qa="game-shelf" data-pending-writes={pendingWrites}>
      {games.length > 0 ? (
        <div className="game-shelf__list">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="game-shelf__empty" data-qa="game-shelf-empty">
          {t('Game shelf is empty')}
        </div>
      )}
    </div>
  );
};
