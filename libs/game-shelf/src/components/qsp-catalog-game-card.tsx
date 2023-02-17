import { Cross1Icon, UpdateIcon } from '@radix-ui/react-icons';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Dialog from '@radix-ui/react-dialog';
import { useAtom, useSetup } from '@xoid/react';
import { useCallback, useState } from 'react';
import { create } from 'xoid';
import { useTranslation } from 'react-i18next';
import { games$ } from '../game-shelf';
import { CatalogGame, idPrefix, moveToShelf } from '../qsp-catalog';
import { ContentRenderer, formatDate } from '@qspider/renderer';
import { formatBytes } from '../formatters';

export const CatalogGameCard: React.FC<{ game: CatalogGame }> = (props) => {
  const { t } = useTranslation();
  const isOnShelf$ = useSetup((props$) => {
    const gameId$ = props$.focus((p) => p.game.id);
    return create((get) => {
      const games = get(games$);
      const gameId = idPrefix + get(gameId$);
      return gameId in games;
    });
  }, props);
  const isOnShelf = useAtom(isOnShelf$);
  const { game } = props;
  const icon = game.icon ? game.icon.substring(game.icon.lastIndexOf('com_sobi2')) : null;
  const [isMoving, setIsMoving] = useState(false);
  const doMove = useCallback(async () => {
    setIsMoving(true);
    await moveToShelf(game);
    setIsMoving(false);
  }, [game]);
  return (
    <Dialog.Root>
      <div className="q-catalog__card" data-id={game.id}>
        <h5 className="q-title">
          {game.icon && <img alt="" src={'https://qsp.su/gamestock/image.php?name=' + icon} loading="lazy" />}
          {game.title}
        </h5>

        <div className="q-catalog__card-details">
          <div>
            <div className="q-catalog__card-details-row">
              {t('Author')}: {game.author}
            </div>
            {game.ported_by && (
              <div className="q-catalog__card-details-row">
                {t('Ported by')}: {game.ported_by}
              </div>
            )}
            <div className="q-catalog__card-details-row">
              {t('Version')}: {game.version}
            </div>
          </div>
          <div>
            <div className="q-catalog__card-details-row">
              {t('Size')}: {formatBytes(game.file_size)}
            </div>
            <div className="q-catalog__card-details-row">
              {t('Type')}: {game.file_ext}
            </div>
            <div className="q-catalog__card-details-row">
              {t('Last update')}: {formatDate(new Date(game.mod_date))}
            </div>
          </div>
        </div>
        <div className="q-catalog__card-buttons">
          {game.description ? (
            <Dialog.Trigger asChild>
              <button className="q-ghost-button">{t('Read Description')}</button>
            </Dialog.Trigger>
          ) : (
            <div></div>
          )}
          {isOnShelf ? (
            <span>{t('On Shelf')}</span>
          ) : (
            <button className="q-button" disabled={isMoving} onClick={doMove}>
              {isMoving ? (
                <span className="q-spin">
                  <UpdateIcon />
                </span>
              ) : (
                t('Add to shelf')
              )}
            </button>
          )}
        </div>
        {game.description ? (
          <Dialog.Portal>
            <Dialog.Overlay className="qspider-dialog-overlay" />
            <Dialog.Content className="qspider-dialog-content">
              <ScrollArea.Root className="qspider-scroll-root">
                <ScrollArea.Viewport className="qspider-scroll-area">
                  <ContentRenderer content={game.description} />
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className="qspider-scroll-bar" orientation="vertical">
                  <ScrollArea.Thumb className="qspider-scroll-thumb" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
              <Dialog.Close className="q-ghost-button q-dialog-close" aria-label="Close">
                <Cross1Icon />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </div>
    </Dialog.Root>
  );
};
