import { QspiderLoader } from '@qspider/renderer';
import { Cross1Icon, DoubleArrowDownIcon, DoubleArrowUpIcon, UpdateIcon } from '@radix-ui/react-icons';

import { useAtom } from '@xoid/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  catalogLoading$,
  loadMoreCatalog,
  loadQspAuthors,
  loadQspCatalog,
  qspAuthorFilter$,
  qspAuthors$,
  qspCatalogList$,
  qspFeaturedFilter$,
  qspSortByField$,
  qspSortDirection$,
  qspTitleSearch$,
  toggleSortDirection,
} from '../qsp-catalog';
import { CatalogGameCard } from './qsp-catalog-game-card';
import { Combobox, Select, Switch, Tooltip } from './primitives';

const sortOptions = [
  { label: 'Latest', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Most Downloaded', value: 'downloads' },
  { label: 'Most Played', value: 'plays' },
  { label: 'Most Comments', value: 'comments' },
];

export const QspCatalog: React.FC = () => {
  const { t } = useTranslation();
  const loadingState = useAtom(catalogLoading$);
  const games = useAtom(qspCatalogList$);
  const authors = useAtom(qspAuthors$);
  const authorsFilter = useAtom(qspAuthorFilter$);
  const sortField = useAtom(qspSortByField$);
  const sortDirection = useAtom(qspSortDirection$);
  const search = useAtom(qspTitleSearch$);
  const featured = useAtom(qspFeaturedFilter$);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load authors on first mount
  useEffect(() => {
    loadQspAuthors();
  }, []);

  // Reload when sort/author/language filters change
  useEffect(() => {
    loadQspCatalog(1, true);
  }, [sortField, sortDirection, authorsFilter, featured]);

  // Debounced reload when search text changes
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (search.length > 0 && search.length <= 2) return;
    searchDebounceRef.current = setTimeout(() => {
      loadQspCatalog(1, true);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const scrollContainer = sentinel.closest('.qspider-player-main');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreCatalog();
        }
      },
      { root: scrollContainer, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isInitialLoading = (loadingState === 'pending' || loadingState === 'loading') && !games.length;

  return (
    <div>
      <div className="q-catalog__filterbar">
        <div className="q-catalog__filterbar-block">
          <label>{t('Filter by Author')}:</label>
          <div className="q-catalog__filterbar-group">
            <Combobox
              options={authors.map((a) => ({ label: `${a.names} (${a.games_count})`, value: a.names }))}
              placeholder={t('All') ?? ''}
              searchPlaceholder={t('Search authors') ?? ''}
              label={t('Author') ?? ''}
              value={authorsFilter}
              onValueChange={(value): void => qspAuthorFilter$.set(value)}
            />
            {authorsFilter ? (
              <Tooltip content={t('Clear Author filter')}>
                <button
                  className="q-ghost-button"
                  aria-label={t('Clear Author filter') ?? ''}
                  onClick={(): void => qspAuthorFilter$.set('')}
                >
                  <Cross1Icon />
                </button>
              </Tooltip>
            ) : null}
          </div>
        </div>
        <div className="q-catalog__filterbar-block">
          <label>{t('Sort by')}:</label>
          <div className="q-catalog__filterbar-group">
            <Select
              options={sortOptions.map((o) => ({ ...o, label: t(o.label) }))}
              placeholder={t('Sort by')}
              label={t('Sort field')}
              value={sortField}
              onValueChange={(value): void => qspSortByField$.set(value)}
            />

            <Tooltip content={sortDirection === 'asc' ? t('Sort Ascending') || '' : t('Sort Descending') || ''}>
              <button
                className="q-ghost-button"
                onClick={toggleSortDirection}
                aria-label={sortDirection === 'asc' ? t('Sort Ascending') || '' : t('Sort Descending') || ''}
              >
                {sortDirection === 'asc' ? <DoubleArrowDownIcon /> : <DoubleArrowUpIcon />}
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="q-catalog__filterbar-block">
          <label>{t('Featured only')}:</label>
          <Switch checked={featured} onChange={(checked): void => qspFeaturedFilter$.set(checked)} />
        </div>
        <div className="q-catalog__filterbar-block">
          <label htmlFor="search-input">{t('Search')}:</label>
          <div>
            <input
              name="search-input"
              type="text"
              className="q-input"
              value={search}
              onInput={(e): void => qspTitleSearch$.set((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </div>
      {isInitialLoading ? (
        <QspiderLoader />
      ) : loadingState === 'failed' ? (
        <>
          {t('Loading failed')}
          <button onClick={(): void => void loadQspCatalog()}>{t('Retry')}</button>
        </>
      ) : (
        <>
          {games.length === 0 ? (
            <div className="q-catalog__empty">{t('No games found')}</div>
          ) : (
            <div className="q-catalog__list">
              {games.map((game) => (
                <CatalogGameCard key={game.slug} game={game} />
              ))}
            </div>
          )}
          {loadingState === 'loading-more' && (
            <div className="q-catalog__load-more">
              <span className="q-spin">
                <UpdateIcon />
              </span>
            </div>
          )}
        </>
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};
