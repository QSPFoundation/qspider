import { QspiderLoader, Select, Tooltip } from '@qspider/renderer';
import { Cross1Icon, DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';

import { useAtom } from '@xoid/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  catalogLoading$,
  loadQspCatalog,
  qspAuthorFilter$,
  qspAuthors$,
  qspCatalogPreparedList$,
  qspSortByField$,
  qspSortDirection$,
  qspTitleSearch$,
  toggleSortDirection,
} from '../qsp-catalog';
import { CatalogGameCard } from './qsp-catalog-game-card';

const sortOptions = [
  {
    label: 'Title',
    value: 'title',
  },
  {
    label: 'Size',
    value: 'file_size',
  },
  {
    label: 'Last Updated',
    value: 'mod_date',
  },
];

export const QspCatalog: React.FC = () => {
  useEffect(() => {
    loadQspCatalog();
  }, []);
  const { t } = useTranslation();
  const loadingState = useAtom(catalogLoading$);
  const games = useAtom(qspCatalogPreparedList$);
  const authors = useAtom(qspAuthors$);
  const authorsFilter = useAtom(qspAuthorFilter$);
  const sortField = useAtom(qspSortByField$);
  const sortDirection = useAtom(qspSortDirection$);
  const search = useAtom(qspTitleSearch$);

  if ((loadingState === 'pending' || loadingState === 'loading') && !games.length) return <QspiderLoader />;
  if (loadingState === 'failed')
    return (
      <>
        {t('Loading failed')}
        <button
          onClick={(): void => {
            loadQspCatalog();
          }}
        >
          {t('Retry')}
        </button>
      </>
    );
  return (
    <div>
      <div className="q-catalog__filterbar">
        <div className="q-catalog__filterbar-block">
          <label>{t('Filter by Author')}:</label>
          <div>
            <Select
              name="author-filter"
              options={authors.map((author) => ({ label: author, value: author }))}
              placehoder=""
              label="Author"
              value={authorsFilter}
              onValueChange={(value): void => qspAuthorFilter$.set(value)}
            />
          </div>
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
        <div className="q-catalog__filterbar-block">
          <label>{t('Sort by')}:</label>
          <div>
            <Select
              options={sortOptions.map((o) => ({ ...o, label: t(o.label) }))}
              placehoder={t('Sort by')}
              label={t('Sort field')}
              value={sortField}
              onValueChange={(value): void => qspSortByField$.set(value)}
            />
          </div>
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
        <div className="q-catalog__filterbar-block">
          <label htmlFor="search-input">{t('Search')}:</label>
          <div>
            <input
              name="search-input"
              type="text"
              className="q-input"
              value={search}
              onInput={(e): void => qspTitleSearch$.set((e.target as any).value)}
            />
          </div>
        </div>
      </div>
      <div className="q-catalog__list">
        {games.map((game) => (
          <CatalogGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
