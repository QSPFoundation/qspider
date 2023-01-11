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
} from '@qspider/game-state';
import { Cross1Icon, DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';

import { useAtom } from '@xoid/react';
import { useEffect } from 'react';
import { QspiderLoader } from './loader';
import { Select } from './primitives/select';
import { CatalogGameCard } from './qsp-catalog-game-card';
import { QspiderTooltip } from './tooltip';

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
        Loading failed{' '}
        <button
          onClick={(): void => {
            loadQspCatalog();
          }}
        >
          Retry
        </button>
      </>
    );
  return (
    <div>
      <div className="q-catalog__filterbar">
        <div className="q-catalog__filterbar-block">
          <label>Filter by Author:</label>
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
            <QspiderTooltip content="Clear Author filter">
              <button
                className="q-ghost-button"
                aria-label="Clear Author filter"
                onClick={(): void => qspAuthorFilter$.set('')}
              >
                <Cross1Icon />
              </button>
            </QspiderTooltip>
          ) : null}
        </div>
        <div className="q-catalog__filterbar-block">
          <label>Sort by:</label>
          <div>
            <Select
              options={sortOptions}
              placehoder="Sort by"
              label="Sort field"
              value={sortField}
              onValueChange={(value): void => qspSortByField$.set(value)}
            />
          </div>
          <button
            className="q-ghost-button"
            onClick={toggleSortDirection}
            aria-label={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            {sortDirection === 'asc' ? <DoubleArrowDownIcon /> : <DoubleArrowUpIcon />}
          </button>
        </div>
        <div className="q-catalog__filterbar-block">
          <label htmlFor="search-input">Search:</label>
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
