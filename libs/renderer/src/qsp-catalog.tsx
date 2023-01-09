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

import { useAtom } from '@xoid/react';
import { useEffect } from 'react';
import { Select } from './primitives/select';
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
  const loadingState = useAtom(catalogLoading$);
  const games = useAtom(qspCatalogPreparedList$);
  const authors = useAtom(qspAuthors$);
  const authorsFilter = useAtom(qspAuthorFilter$);
  const sortField = useAtom(qspSortByField$);
  const sortDirection = useAtom(qspSortDirection$);
  const search = useAtom(qspTitleSearch$);
  if ((loadingState === 'pending' || loadingState === 'loading') && !games.length) return <>Loading</>;
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
      <Select
        options={authors.map((author) => ({ label: author, value: author }))}
        placehoder="Filter by author"
        label="Author"
        value={authorsFilter || undefined}
        onValueChange={(value): void => qspAuthorFilter$.set(value)}
      />
      <Select
        options={sortOptions}
        placehoder="Sort by"
        label="Sort field"
        value={sortField}
        onValueChange={(value): void => qspSortByField$.set(value)}
      />
      <button onClick={toggleSortDirection}>{sortDirection}</button>
      <input
        type="text"
        className="q-input"
        value={search}
        onInput={(e): void => qspTitleSearch$.set((e.target as any).value)}
      />
      <div>
        {games.map((game) => (
          <CatalogGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
