import { GameShelfEntry } from '@qspider/contracts';
import { Cross1Icon } from '@radix-ui/react-icons';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Dialog from '@radix-ui/react-dialog';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { games$, goToGame } from '../game-shelf';
import { useAtom, useSetup } from '@xoid/react';
import { moveToShelf, qspCatalogList$ } from '../qsp-catalog';
import { atom } from 'xoid';
import { templateParser } from '@qspider/renderer';
import { Markup } from '@qspider/html-renderer';

export const GameCard: React.FC<{ game: GameShelfEntry }> = (props) => {
  const { game } = props;
  const description$ = useSetup((props$) => {
    const description = props$.focus((s) => s.game.description);
    return atom((get) => templateParser.parse(get(description) ?? ''));
  }, props);
  const { t } = useTranslation();
  const removeGame = useCallback(() => {
    games$.actions.remove(game.id);
  }, [game.id]);

  const catalogEntry$ = useSetup((props$) => {
    const game$ = props$.focus((p) => p.game);
    return atom((get) => {
      const sourceId = get(game$).meta?.source_id;
      if (!sourceId) return null;
      const id = parseInt(sourceId);
      return get(qspCatalogList$).find((entry) => entry.id === id);
    });
  }, props);
  const catalogEntry = useAtom(catalogEntry$);
  const description = useAtom(description$);
  const hasUpdates = game.meta && catalogEntry ? game.meta.source_date < catalogEntry.mod_date : false;
  const updateToLatest = (): void => {
    if (!hasUpdates || !catalogEntry) return;
    moveToShelf(catalogEntry);
  };
  return (
    <Dialog.Root>
      <div className="game-shelf__card" data-qa={`game-${game.id}`}>
        <div className="game-shelf__card-content">
          <button
            type="button"
            className="q-ghost-button q-remove-game-button"
            title="Remove from Game Shelf"
            onClick={removeGame}
          >
            <Cross1Icon />
          </button>
          <h3 className="game-shelf__card-title">
            {game.icon && <img alt="" src={game.icon} loading="lazy" />}
            {game.title}
          </h3>
        </div>
        <div className="game-shelf__card-details">
          {game.author && (
            <div className="game-shelf__card-details-row">
              {t('Author')}: {game.author}
            </div>
          )}
          {game.ported_by && (
            <div className="game-shelf__card-details-row">
              {t('Ported by')}: {game.ported_by}
            </div>
          )}
          {game.version && (
            <div className="game-shelf__card-details-row">
              {t('Version')}: {game.version}
            </div>
          )}
        </div>
        {hasUpdates && (
          <div className="game-shelf__card-actions">
            {t('Game has been updated in catalog')}
            <button className="q-button" onClick={updateToLatest}>
              {t('Update on shelf')}
            </button>
          </div>
        )}
        <div className="game-shelf__card-actions">
          {game.description ? (
            <Dialog.Trigger asChild>
              <button className="q-ghost-button">{t('Read Description')}</button>
            </Dialog.Trigger>
          ) : (
            <div></div>
          )}
          <a
            href="#"
            onClick={(e): void => {
              e.preventDefault();
              goToGame(game.id);
            }}
          >
            {t('Run')}
          </a>
        </div>
        {game.description && (
          <Dialog.Portal>
            <Dialog.Overlay className="qspider-dialog-overlay" />
            <Dialog.Content className="qspider-dialog-content">
              <ScrollArea.Root className="qspider-scroll-root">
                <ScrollArea.Viewport className="qspider-scroll-area">
                  <Markup content={description} />
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
        )}
      </div>
    </Dialog.Root>
  );
};
