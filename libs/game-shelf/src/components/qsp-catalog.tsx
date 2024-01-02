import { QspiderLoader } from '@qspider/renderer';
import { Cross1Icon, DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';

import { useAtom } from '@xoid/react';
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
  onlyAero$,
  toggleSortDirection,
} from '../qsp-catalog';
import { CatalogGameCard } from './qsp-catalog-game-card';
import { Select, Tooltip } from './primitives';
import { Switch } from './primitives/switch';

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

loadQspCatalog();

export const QspCatalog: React.FC = () => {
  const { t } = useTranslation();
  const loadingState = useAtom(catalogLoading$);
  const games = useAtom(qspCatalogPreparedList$);
  const authors = useAtom(qspAuthors$);
  const authorsFilter = useAtom(qspAuthorFilter$);
  const sortField = useAtom(qspSortByField$);
  const sortDirection = useAtom(qspSortDirection$);
  const search = useAtom(qspTitleSearch$);
  const onlyAero = useAtom(onlyAero$);

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
          <div className="q-catalog__filterbar-group">
            <Select
              name="author-filter"
              options={authors.map((author) => ({ label: author, value: author }))}
              placeholder=""
              label="Author"
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
          <label htmlFor="only-aero">{t('Aero games')}</label>
          <Switch checked={onlyAero} onChange={(checked): void => onlyAero$.set(checked)} />
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
      <div className="q-catalog__list">
        {games.map((game) => (
          <CatalogGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
