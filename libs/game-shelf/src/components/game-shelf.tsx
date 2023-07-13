import { useAtom } from '@xoid/react';
import { gamesList$ } from '../game-shelf';
import { GameCard } from './game-card';
import { useTranslation } from 'react-i18next';

export const GameShelf: React.FC = () => {
  const games = useAtom(gamesList$);
  const { t } = useTranslation();
  return (
    <div className="game-shelf">
      {games.length > 0 ? (
        <div className="game-shelf__list">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="game-shelf__empty">{t('Game shelf is empty')}</div>
      )}
    </div>
  );
};
