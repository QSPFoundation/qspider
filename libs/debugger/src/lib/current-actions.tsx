import { useAtom } from '@xoid/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { actions$, debugActionRun$, debugActions, debugCodeView$ } from '@qspider/game-state';

/** The actions the player sees now, in order: a click shows one's code; the one running is marked. */
export const CurrentActions: React.FC = () => {
  const { t } = useTranslation();
  const actions = useAtom(actions$);
  const actionRun = useAtom(debugActionRun$);
  const codeView = useAtom(debugCodeView$);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="qsp-debugger-current-actions" data-qa="debug-current-actions">
      <button
        type="button"
        data-qa="debug-current-actions-toggle"
        aria-expanded={expanded}
        className="qsp-debugger-current-actions-header"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="qsp-debugger-current-actions-chevron">{expanded ? '▾' : '▸'}</span>
        {t('Current actions ({{count}})', { count: actions.length })}
      </button>
      {expanded && (
        <div className="qsp-debugger-current-actions-list">
          {actions.length === 0 && <div className="qsp-debugger-no-data">{t('No current actions')}</div>}
          {actions.map((action, index) => {
            const isRunning = actionRun?.index === index && actionRun.name === action.name;
            const isSelected = codeView.kind === 'current-action' && codeView.index === index;
            return (
              <div
                key={index}
                data-qa="debug-current-action"
                data-action={action.name}
                data-running={isRunning}
                className={`qsp-debugger-location-item ${isSelected ? 'selected' : ''} ${
                  isRunning ? 'current-execution' : ''
                }`}
                onClick={() => debugActions.selectCurrentAction(index)}
              >
                <span className="qsp-debugger-location-name">
                  {isRunning && <span className="execution-indicator">▶ </span>}
                  {action.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
