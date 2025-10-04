import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';
import * as RadixTabs from '@radix-ui/react-tabs';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import {
  debugState$,
  debugActions,
  enableDebugMode,
  disableDebugMode,
  canStep$,
} from '@qspider/game-state';
import { TooltipButton } from './tooltip-button';
import { formatEventArgs } from './debug-utils';

export const LocationRightPanel: React.FC = () => {
  const { t } = useTranslation();
  const debugState = useAtom(debugState$);
  const canStep = useAtom(canStep$);

  const handleToggleDebug = (): void => {
    if (debugState.isEnabled) {
      disableDebugMode();
    } else {
      enableDebugMode();
    }
  };

  return (
    <RadixTabs.Root defaultValue="execution" className="qsp-debugger-right-panel">
      <RadixTabs.List className="qsp-debugger-right-panel-tabs">
        <RadixTabs.Trigger value="execution" className="qsp-debugger-right-panel-tab">
          {t('Execution')}
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value="breakpoints" className="qsp-debugger-right-panel-tab">
          {t('Breakpoints')}
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value="events" className="qsp-debugger-right-panel-tab">
          {t('Events')}
        </RadixTabs.Trigger>
      </RadixTabs.List>

      <RadixTabs.Content value="execution" className="qsp-debugger-right-panel-content">
        <div>
          <div className="qsp-debugger-execution-info">
            <div className="qsp-debugger-execution-label">{t('Debug Mode')}</div>
            <div className="qsp-debugger-debug-toggle-section">
              <div className={`qsp-debugger-status ${debugState.isEnabled ? 'enabled' : 'disabled'}`}>
                {debugState.isEnabled ? (
                  debugState.isPaused ? (
                    <span className="status-paused">⏸ {t('Paused')}</span>
                  ) : (
                    <span className="status-running">▶ {t('Running')}</span>
                  )
                ) : (
                  <span className="status-disabled">⏹ {t('Disabled')}</span>
                )}
              </div>
              <RadixTooltip.Provider>
                <TooltipButton
                  onClick={handleToggleDebug}
                  tooltip={debugState.isEnabled ? t('Stop debugging session') : t('Start debugging session')}
                  className={`q-button qsp-debugger-toggle-button ${debugState.isEnabled ? 'enabled' : 'disabled'}`}
                >
                  {debugState.isEnabled ? t('Disable') : t('Enable')}
                </TooltipButton>
              </RadixTooltip.Provider>
            </div>
          </div>

          {debugState.isEnabled && (
            <RadixTooltip.Provider>
              <div className="qsp-debugger-controls">
                {debugState.isPaused ? (
                  <>
                    <TooltipButton
                      onClick={debugActions.resumeExecution}
                      tooltip={t('Resume execution (F5)')}
                      className="q-button qsp-debugger-control-button resume"
                    >
                      ▶ {t('Resume')}
                    </TooltipButton>
                    <TooltipButton
                      disabled={!canStep}
                      onClick={debugActions.stepExecution}
                      tooltip={t('Step to next line (F10)')}
                      className="q-button qsp-debugger-control-button step"
                    >
                      ⏭ {t('Step')}
                    </TooltipButton>
                  </>
                ) : (
                  <TooltipButton
                    onClick={debugActions.pauseExecution}
                    tooltip={t('Pause execution (F5 or F9)')}
                    className="q-button qsp-debugger-control-button pause"
                  >
                    ⏸ {t('Pause')}
                  </TooltipButton>
                )}
                <TooltipButton
                  onClick={debugActions.clearExecutionHistory}
                  tooltip={t('Clear execution history')}
                  className="q-button qsp-debugger-control-button clear"
                >
                  🗑 {t('Clear')}
                </TooltipButton>
              </div>
            </RadixTooltip.Provider>
          )}

          {debugState.isEnabled && (
            <div className="qsp-debugger-execution-info">
              <div className="qsp-debugger-execution-label">{t('Pause on Links')}</div>
              <div className="qsp-debugger-debug-toggle-section">
                <div className={`qsp-debugger-status ${debugState.autoPauseOnLinks ? 'enabled' : 'disabled'}`}>
                  {debugState.autoPauseOnLinks ? (
                    <span className="status-running">✓ {t('Enabled')}</span>
                  ) : (
                    <span className="status-disabled">✗ {t('Disabled')}</span>
                  )}
                </div>
                <RadixTooltip.Provider>
                  <TooltipButton
                    onClick={debugActions.toggleAutoPauseOnLinks}
                    tooltip={debugState.autoPauseOnLinks ? t('Disable pausing on link execution') : t('Enable pausing on link execution')}
                    className={`q-button qsp-debugger-toggle-button ${debugState.autoPauseOnLinks ? 'enabled' : 'disabled'}`}
                  >
                    {debugState.autoPauseOnLinks ? t('Disable') : t('Enable')}
                  </TooltipButton>
                </RadixTooltip.Provider>
              </div>
            </div>
          )}

          <div className="qsp-debugger-execution-info">
            <div className="qsp-debugger-execution-label">{t('Current Execution')}</div>
            {debugState.currentRecord ? (
              <div className="qsp-debugger-current-execution">
                <div>{t('Location')}: {debugState.currentRecord.loc}</div>
                <div>{t('Line')}: {debugState.currentRecord.line}</div>
                <div>{t('Action')}: {debugState.currentRecord.actIndex}</div>
              </div>
            ) : (
              <div className="qsp-debugger-no-data">{t('No execution data')}</div>
            )}
          </div>

          <div className="qsp-debugger-execution-info">
            <div className="qsp-debugger-execution-label">{t('Execution History')}</div>
            <div className="qsp-debugger-execution-history">
              {debugState.executionHistory.slice(-10).map((record, index) => (
                <div key={index} className="qsp-debugger-history-item">
                  <div>
                    {record.loc}:{record.line}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RadixTabs.Content>

      <RadixTabs.Content value="breakpoints" className="qsp-debugger-right-panel-content">
        {debugState.breakpoints.map((breakpoint) => (
          <div key={breakpoint.id} className="qsp-debugger-breakpoint-item">
            <div className="qsp-debugger-breakpoint-header">
              <span
                className={`qsp-debugger-breakpoint-location ${breakpoint.enabled ? '' : 'disabled'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => debugActions.selectLocationWithLine(breakpoint.location, breakpoint.line ?? null)}
              >
                {breakpoint.location}
                {breakpoint.line && `:${breakpoint.line}`}
              </span>
              <div className="qsp-debugger-breakpoint-controls">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    debugActions.toggleBreakpoint(breakpoint.id);
                  }}
                  className={`qsp-debugger-breakpoint-control ${breakpoint.enabled ? 'enabled' : ''}`}
                >
                  {breakpoint.enabled ? t('Enabled') : t('Disabled')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    debugActions.removeBreakpoint(breakpoint.id);
                  }}
                  className="qsp-debugger-breakpoint-control remove"
                >
                  {t('Remove')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {debugState.breakpoints.length === 0 && <div className="qsp-debugger-no-data">{t('No breakpoints set')}</div>}
      </RadixTabs.Content>

      <RadixTabs.Content value="events" className="qsp-debugger-right-panel-content">
        <div className="qsp-debugger-events-header">
          <RadixTooltip.Provider>
            <div className="qsp-debugger-events-controls">
              <TooltipButton
                onClick={debugActions.clearEventLog}
                tooltip={t('Clear all logged events')}
                className="q-button qsp-debugger-control-button clear"
              >
                🗑 {t('Clear Events')}
              </TooltipButton>
            </div>
          </RadixTooltip.Provider>
          <div className="qsp-debugger-events-count">{t('Events')}: {debugState.eventLog.length}</div>
        </div>
        <div className="qsp-debugger-events-list">
          {debugState.eventLog
            .slice()
            .reverse()
            .map((entry) => (
              <div key={entry.id} className="qsp-debugger-event-item">
                <div className="qsp-debugger-event-header">
                  <span className="qsp-debugger-event-name">{entry.event}</span>
                  <span className="qsp-debugger-event-timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
                {entry.args.length > 0 && (
                  <div className="qsp-debugger-event-args">
                    {formatEventArgs(entry.event, entry.args).map((formattedArg, index) => (
                      <div key={index} className="qsp-debugger-event-arg">
                        <span className="qsp-debugger-event-arg-name">{formattedArg.name}:</span>
                        <span className="qsp-debugger-event-arg-value">{formattedArg.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        {debugState.eventLog.length === 0 && <div className="qsp-debugger-no-data">{t('No events logged yet')}</div>}
      </RadixTabs.Content>
    </RadixTabs.Root>
  );
};