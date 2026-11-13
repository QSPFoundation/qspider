import { useState } from 'react';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';
import {
  changeNotice$,
  debugState$,
  indexText,
  showValue,
  watchActions,
  watchChanged$,
  watchKey,
  watchList$,
  watchPause$,
  watchValues$,
  type WatchValue,
} from '@qspider/game-state';

/** The text of an entry's value: a variable with nothing in it is "not set". */
function entryText(value: WatchValue | undefined, notSet: string): string {
  if (!value) return '';
  if (value.value === undefined && value.size === 0) return notSet;
  return showValue(value.value);
}

/** Whether an entry can expand: an array (several items, or keyed ones) or a tuple. */
function expandable(value: WatchValue | undefined): boolean {
  if (!value) return false;
  return value.size > 1 || value.items.some((item) => item.key !== undefined) || Array.isArray(value.value);
}

function WatchRows({ value }: { value: WatchValue }) {
  if (value.items.length > 0) {
    return (
      <div className="qsp-debugger-watch-rows">
        {value.items.map((item, i) => (
          <div key={i} className="qsp-debugger-watch-row" data-qa="debug-watch-item">
            <span className="qsp-debugger-watch-row-key">{indexText(item.key, i)}</span>
            <span className="qsp-debugger-watch-row-arrow">→</span>
            <span className="qsp-debugger-watch-row-value">{showValue(item.value)}</span>
          </div>
        ))}
        {value.size > value.items.length && <div className="qsp-debugger-watch-row">… ({value.size} items)</div>}
      </div>
    );
  }
  const tuple = Array.isArray(value.value) ? value.value : [];
  return (
    <div className="qsp-debugger-watch-rows">
      {tuple.map((item, i) => {
        const name = tuple.names?.[i];
        return (
          <div key={i} className="qsp-debugger-watch-row" data-qa="debug-watch-item">
            <span className="qsp-debugger-watch-row-key">{name ?? i}</span>
            <span className="qsp-debugger-watch-row-value">{showValue(item)}</span>
          </div>
        );
      })}
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
                {entryText(value, t('not set'))}
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
