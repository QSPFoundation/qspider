import { Cross1Icon, UpdateIcon, DownloadIcon, PlayIcon, HeartIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Dialog from '@radix-ui/react-dialog';
import { useAtom, useSetup } from '@xoid/react';
import { useCallback, useState } from 'react';
import { atom } from 'xoid';
import { useTranslation } from 'react-i18next';
import { gameSourceMap$ } from '../game-shelf';
import { CatalogGame, moveToShelf, sourceName } from '../qsp-catalog';
import { templateParser } from '@qspider/renderer';
import { formatBytes } from '../formatters';
import { formatDate } from '@qspider/i18n';
import { Markup } from '@qspider/html-renderer';
import { Tooltip } from './primitives';

export const CatalogGameCard: React.FC<{ game: CatalogGame }> = (props) => {
  const { t } = useTranslation();
  const isOnShelf$ = useSetup((props$) => {
    const gameSlug$ = props$.focus((p) => p.game.slug);
    return atom((get) => {
      const existingCatalogGames = get(gameSourceMap$).get(sourceName);
      const gameSlug = get(gameSlug$);
      return existingCatalogGames?.has(gameSlug);
    });
  }, props);
  const description$ = useSetup((props$) => {
    const description = props$.focus((s) => s.game.description_html);
    return atom((get) => templateParser.parse(get(description)));
  }, props);
  const isOnShelf = useAtom(isOnShelf$);
  const description = useAtom(description$);
  const { game } = props;
  const [isMoving, setIsMoving] = useState(false);
  const doMove = useCallback(async () => {
    setIsMoving(true);
    await moveToShelf(game);
    setIsMoving(false);
  }, [game]);
  return (
    <Dialog.Root>
      <div className="q-catalog__card" data-id={game.slug}>
        <h5 className="q-title">
          {game.icon_url && <img alt="" src={game.icon_url} loading="lazy" />}
          {game.name}
        </h5>

        <div className="q-catalog__card-details">
          <div>
            <div className="q-catalog__card-details-row">
              {t('Author')}: {game.authors}
            </div>
            {game.translators && (
              <div className="q-catalog__card-details-row">
                {t('Ported by')}: {game.translators}
              </div>
            )}
            <div className="q-catalog__card-details-row">
              {t('Version')}: {game.ver}
            </div>
          </div>
          <div>
            {game.file_size != null && (
              <div className="q-catalog__card-details-row">
                {t('Size')}: {formatBytes(game.file_size)}
              </div>
            )}
            <div className="q-catalog__card-details-row">
              {t('Last update')}: {formatDate(new Date(game.updated_at))}
            </div>
          </div>
        </div>
        <div className="q-catalog__card-engagement">
          <Tooltip content={t('Downloads')}>
            <span aria-label={`${t('Downloads')}: ${game.downloads_count}`}><DownloadIcon aria-hidden="true" /> {game.downloads_count}</span>
          </Tooltip>
          <Tooltip content={t('Plays')}>
            <span aria-label={`${t('Plays')}: ${game.plays_count}`}><PlayIcon aria-hidden="true" /> {game.plays_count}</span>
          </Tooltip>
          <Tooltip content={t('Likes')}>
            <span aria-label={`${t('Likes')}: ${game.likes_count}`}><HeartIcon aria-hidden="true" /> {game.likes_count}</span>
          </Tooltip>
          <Tooltip content={t('Comments')}>
            <span aria-label={`${t('Comments')}: ${game.comments_count}`}><ChatBubbleIcon aria-hidden="true" /> {game.comments_count}</span>
          </Tooltip>
        </div>
        <div className="q-catalog__card-buttons">
          {game.description_html ? (
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
        {game.description_html ? (
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
        ) : null}
      </div>
    </Dialog.Root>
  );
};
