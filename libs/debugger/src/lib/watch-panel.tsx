import { useState } from 'react';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';
import {
  changeNotice$,
  debugState$,
  indexText,
  itemWindow,
  showValue,
  watchActions,
  WATCH_ITEM_CAP,
  watchChanged$,
  watchKey,
  watchList$,
  watchPause$,
  watchValues$,
  type WatchValue,
} from '@qspider/game-state';

type QspVariableValue = WatchValue['value'];
type QspTuple = Extract<QspVariableValue, readonly unknown[]>;

/** The text of an entry's value: a variable with no cells is "not set" (the engine reads it as '', 0 or []). */
function entryText(value: WatchValue | undefined, notSet: string, items: (n: number) => string): string {
  if (!value) return '';
  if (value.size === 0) return notSet;
  if (value.size > 1) return items(value.size);
  return showValue(value.value);
}

/** Whether an entry can expand: an array (several items, or a keyed one) or a tuple. */
function expandable(value: WatchValue | undefined): boolean {
  if (!value || value.size === 0) return false;
  return value.size > 1 || value.items.some((item) => item.key !== undefined) || Array.isArray(value.value);
}

/** Most rows a list shows before "… n more": the same cap the watch snapshot puts on the items it reads. */
const ROW_CAP = WATCH_ITEM_CAP;

/**
 * One row: its key, an optional arrow, and its value. A tuple value gets an expand control (collapsed by default)
 * and, when open, its own rows, so nested values expand on demand.
 */
function Row({ rowKey, arrow, value }: { rowKey: string; arrow?: boolean; value: QspVariableValue }) {
  const [open, setOpen] = useState(false);
  const nested = Array.isArray(value);
  return (
    <div>
      <div className="qsp-debugger-watch-row" data-qa="debug-watch-row" data-key={rowKey}>
        {nested ? (
          <button
            type="button"
            className="qsp-debugger-watch-expand"
            data-qa="debug-watch-expand"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : null}
        <span className="qsp-debugger-watch-row-key">{rowKey}</span>{' '}
        {arrow && <span className="qsp-debugger-watch-row-arrow">→ </span>}
        <span className="qsp-debugger-watch-row-value">{nested && open ? '' : showValue(value)}</span>
      </div>
      {nested && open && <TupleRows tuple={value} />}
    </div>
  );
}

/** The "… n more" line after a capped list of rows. */
function MoreRow({ count }: { count: number }) {
  const { t } = useTranslation();
  return <div className="qsp-debugger-watch-row">{`… ${count} ${t('more')}`}</div>;
}

/** The rows of a tuple: named (`NAME  value`) for a record's fields, numbered otherwise; the first `ROW_CAP` show. */
function TupleRows({ tuple }: { tuple: QspTuple }) {
  const shown = itemWindow(tuple.length, ROW_CAP);
  return (
    <div className="qsp-debugger-watch-rows">
      {tuple.slice(0, shown).map((item, i) => (
        <Row key={i} rowKey={tuple.names?.[i] ?? String(i)} value={item} />
      ))}
      {tuple.length > shown && <MoreRow count={tuple.length - shown} />}
    </div>
  );
}

function WatchRows({ value }: { value: WatchValue }) {
  const keyed = value.size > 1 || value.items.some((item) => item.key !== undefined);
  if (!keyed) return Array.isArray(value.value) ? <TupleRows tuple={value.value} /> : null;
  const shown = itemWindow(value.items.length, ROW_CAP);
  return (
    <div className="qsp-debugger-watch-rows">
      {value.items.slice(0, shown).map((item, i) => (
        <Row key={i} rowKey={indexText(item.key, i)} arrow value={item.value} />
      ))}
      {value.size > shown && <MoreRow count={value.size - shown} />}
    </div>
  );
}

export const WatchPanel: React.FC = () => {
  const { t } = useTranslation();
  const list = useAtom(watchList$);
  const values = useAtom(watchValues$);
  const changed = useAtom(watchChanged$);
  const pausing = useAtom(watchPause$);
  const notice = useAtom(changeNotice$);
  const debugOn = useAtom(debugState$).isEnabled;
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const add = (): void => {
    if (!draft.trim()) return;
    watchActions.add(draft);
    setDraft('');
  };

  return (
    <div className="qsp-debugger-watch" data-qa="debug-watch-panel">
      <div className="qsp-debugger-watch-title">{t('Watch')}</div>
      {notice && (
        <div className="qsp-debugger-watch-notice" data-qa="debug-change-notice">
          {notice.name} {t('changed')} {notice.from} → {notice.to}
          {' · '}
          {notice.betweenRuns ? t('between runs') : notice.loc ? `${notice.loc}, ${t('line')} ${notice.line}` : ''}
        </div>
      )}
      <form
        className="qsp-debugger-watch-add"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          className="qsp-debugger-watch-input"
          data-qa="debug-watch-input"
          value={draft}
          placeholder={t('Variable name')}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="q-button qsp-debugger-control-button" data-qa="debug-watch-add">
          {t('Add')}
        </button>
      </form>
      {!debugOn && list.length > 0 && (
        <div className="qsp-debugger-no-data" data-qa="debug-watch-hint">
          {t('Turn debug mode on to break on change')}
        </div>
      )}
      {list.map((name) => {
        const key = watchKey(name);
        const value = values[key];
        const isChanged = changed.includes(key);
        const isOpen = Boolean(open[key]) && expandable(value);
        const pause = Boolean(pausing[key]);
        return (
          <div
            key={key}
            className={`qsp-debugger-watch-entry${isChanged ? ' changed' : ''}`}
            data-qa="debug-watch-entry"
            data-name={key}
            data-changed={String(isChanged)}
          >
            <div className="qsp-debugger-watch-line">
              {expandable(value) ? (
                <button
                  type="button"
                  className="qsp-debugger-watch-expand"
                  data-qa="debug-watch-expand"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((s) => ({ ...s, [key]: !s[key] }))}
                >
                  {isOpen ? '▾' : '▸'}
                </button>
              ) : (
                <span className="qsp-debugger-watch-expand" />
              )}
              <span className="qsp-debugger-watch-name">{key}</span>
              <span className="qsp-debugger-watch-value" data-qa="debug-watch-value">
                {entryText(value, t('not set'), (n) => `${n} ${t('items')}`)}
              </span>
              <button
                type="button"
                className={`qsp-debugger-watch-button${pause ? ' on' : ''}`}
                data-qa="debug-watch-pause-toggle"
                data-state={pause ? 'on' : 'off'}
                disabled={!debugOn}
                title={debugOn ? t('Pause when this changes') : t('Turn debug mode on to break on change')}
                aria-pressed={pause}
                onClick={() => watchActions.togglePause(name)}
              >
                ⏸
              </button>
              <button
                type="button"
                className="qsp-debugger-watch-button"
                data-qa="debug-watch-remove"
                title={t('Remove')}
                onClick={() => watchActions.remove(name)}
              >
                ✕
              </button>
            </div>
            {isOpen && value && <WatchRows value={value} />}
          </div>
        );
      })}
    </div>
  );
};
