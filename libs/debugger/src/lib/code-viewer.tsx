import { useAtom } from '@xoid/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixSelect from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {
  actions$,
  debugState$,
  debugActions,
  codeInspectorActions,
  getCurrentActionCode,
  type LocationInfo,
} from '@qspider/game-state';
import { MonacoCodeViewer } from './monaco-code-viewer';

export const CodeViewer: React.FC = () => {
  const { t } = useTranslation();
  const debugState = useAtom(debugState$);
  const actions = useAtom(actions$);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCodeType, setSelectedCodeType] = useState<'location' | 'description' | 'action'>('location');
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [lastCurrentRecord, setLastCurrentRecord] = useState<typeof debugState.currentRecord>(null);

  // Force Monaco component to update when breakpoints change
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [debugState.breakpoints]);

  // Auto-select location and highlight line when execution changes (stepping)
  useEffect(() => {
    if (debugState.isEnabled && debugState.currentRecord) {
      // Only auto-select if the current record actually changed (i.e., we stepped)
      const recordChanged =
        lastCurrentRecord?.loc !== debugState.currentRecord.loc ||
        lastCurrentRecord?.line !== debugState.currentRecord.line ||
        lastCurrentRecord?.actIndex !== debugState.currentRecord.actIndex;

      if (recordChanged) {
        setLastCurrentRecord(debugState.currentRecord);
        // A step placed outside the location code keeps the view its step set: a current action, or its code alone.
        if (debugState.stepPlace !== 'location') return;
        debugActions.selectLocation(debugState.currentRecord.loc);

        // Auto-switch to the correct code type (location vs action)
        if (debugState.currentRecord.actIndex >= 0) {
          setSelectedCodeType('action');
          setSelectedActionIndex(debugState.currentRecord.actIndex);
        } else {
          setSelectedCodeType('location');
        }
      }
    }
  }, [debugState.currentRecord, debugState.isEnabled, debugState.stepPlace, lastCurrentRecord]);

  useEffect(() => {
    if (debugState.selectedLocation) {
      // Special case for EXEC Link - show the code directly without fetching
      if (debugState.selectedLocation === '[EXEC Link]') {
        setLocationInfo({
          name: '[EXEC Link]',
          code: debugState.currentRecord?.code ? [debugState.currentRecord.code] : [],
          actions: [],
          actionNames: [],
          description: '',
        });
        setLoading(false);
        setSelectedCodeType('location');
        return;
      }

      setLoading(true);
      codeInspectorActions.getLocationInfo(debugState.selectedLocation).then((info) => {
        setLocationInfo(info);
        setLoading(false);
        setSelectedActionIndex(0); // Reset to first action when location changes
      });
    } else {
      setLocationInfo(null);
    }
  }, [debugState.selectedLocation, debugState.currentRecord]);

  const { codeView, actionRun, currentRecord, stepPlace } = debugState;
  const viewedActionIndex = codeView.kind === 'current-action' ? codeView.index : null;
  // The run that the viewed action is: its saved code survives a `cla`. A list changed under it shows its entry by
  // name: another action at the run's index is not the run.
  const viewedRun =
    viewedActionIndex !== null &&
    actionRun?.index === viewedActionIndex &&
    (viewedActionIndex >= actions.length || actions[viewedActionIndex]?.name === actionRun.name)
      ? actionRun
      : null;
  // Read only when no run saved it; an index past the list (it changed since) has no code.
  const liveActionLines = useMemo(
    () =>
      viewedActionIndex === null || viewedRun || viewedActionIndex >= actions.length
        ? []
        : getCurrentActionCode(viewedActionIndex),
    [viewedActionIndex, viewedRun, actions],
  );

  // A plain-text placeholder for missing code: as QSP it would be highlighted and its words hovered as variables.
  const placeholder = (text: string) => ({ code: text, language: 'plaintext' });
  const qspCode = (code: string, empty: string) => (code ? { code, language: 'qsp' } : placeholder(empty));

  if (viewedActionIndex !== null) {
    const name =
      viewedRun?.name.trim() ||
      actions[viewedActionIndex]?.name.trim() ||
      t('Action {{number}}', { number: viewedActionIndex + 1 });
    const display = qspCode((viewedRun?.lines ?? liveActionLines).join('\n'), t('// Empty action'));
    return (
      <CodeEditor
        code={display.code}
        language={display.language}
        title={t('Current action: {{name}}', { name })}
        currentLine={viewedRun && stepPlace === 'action' ? currentRecord?.line : undefined}
      />
    );
  }

  if (codeView.kind === 'step-code') {
    // A step the debugger can't place: its code alone, as the step runs it.
    const display = qspCode(currentRecord?.code ?? '', t('// No running code'));
    return (
      <CodeEditor
        code={display.code}
        language={display.language}
        title={t('Running code')}
        currentLine={currentRecord ? 1 : undefined}
      />
    );
  }

  if (!debugState.selectedLocation) {
    return <div className="qsp-debugger-empty-state">{t('Select a location to view its code')}</div>;
  }

  if (loading) {
    return <div className="qsp-debugger-loading">{t('Loading code...')}</div>;
  }

  if (!locationInfo) {
    return <div className="qsp-debugger-error">{t('Failed to load location code')}</div>;
  }

  // Determine if we should highlight current execution line
  const getCurrentLine = (): number | undefined => {
    // A step placed elsewhere (a current action's code) is not on a line of this location, whatever its number.
    if (
      !debugState.currentRecord ||
      debugState.currentRecord.loc !== debugState.selectedLocation ||
      stepPlace !== 'location'
    ) {
      return undefined;
    }

    // For EXEC Link, always highlight line 1 (the code being executed)
    if (debugState.selectedLocation === '[EXEC Link]') {
      return 1;
    }

    if (selectedCodeType === 'location') {
      return debugState.currentRecord.line;
    } else if (selectedCodeType === 'action' && debugState.currentRecord.actIndex === selectedActionIndex) {
      return debugState.currentRecord.line;
    }

    return undefined;
  };

  // Determine target line to scroll to (e.g., when clicking a breakpoint)
  const getTargetLine = (): number | undefined => {
    return debugState.targetLine ?? undefined;
  };

  // The text in the editor and its language (a placeholder for missing code is plain text, see above).
  const getCodeToDisplay = (): { code: string; language: string } => {
    const language = selectedCodeType === 'description' ? 'qsp-description' : 'qsp'; // HTML with <<…>> for description
    if (selectedCodeType === 'location') {
      const code = locationInfo.code.join('\n');
      return code ? { code, language } : placeholder(t('// No location code'));
    } else if (selectedCodeType === 'description') {
      return locationInfo.description
        ? { code: locationInfo.description, language }
        : placeholder(t('// No location description'));
    } else {
      const action = locationInfo.actions[selectedActionIndex];
      return action ? { code: action.join('\n'), language } : placeholder(t('// Empty action'));
    }
  };
  const display = getCodeToDisplay();

  const getTitle = (): string => {
    if (selectedCodeType === 'location') {
      return t('Location: {{name}}', { name: locationInfo.name });
    } else if (selectedCodeType === 'description') {
      return t('Description: {{name}}', { name: locationInfo.name });
    } else {
      return t('Action {{index}} in {{location}}', { index: selectedActionIndex + 1, location: locationInfo.name });
    }
  };

  const handleBreakpointToggle = (line: number, location: string, actionIndex?: number): void => {
    // Get fresh state to avoid stale closures
    const currentState = debugState$.value;

    // Check if breakpoint already exists at this location and line
    const existingBreakpoint = currentState.breakpoints.find(
      (bp) => bp.location === location && bp.line === line && bp.actionIndex === actionIndex,
    );

    if (existingBreakpoint) {
      // Toggle existing breakpoint
      debugActions.toggleBreakpoint(existingBreakpoint.id);
    } else {
      // Add new breakpoint
      debugActions.addBreakpoint({
        location,
        line,
        actionIndex,
        enabled: true,
      });
    }
  };

  return (
    <div className="qsp-debugger-code-viewer">
      <div className="qsp-debugger-code-controls">
        <div className="qsp-debugger-code-type-selector">
          <button
            data-qa="debug-code-tab"
            data-code-type="location"
            onClick={() => setSelectedCodeType('location')}
            className={`qsp-debugger-code-type-button ${selectedCodeType === 'location' ? 'active' : ''}`}
          >
            {t('Location Code')}
          </button>
          <button
            data-qa="debug-code-tab"
            data-code-type="description"
            onClick={() => setSelectedCodeType('description')}
            className={`qsp-debugger-code-type-button ${selectedCodeType === 'description' ? 'active' : ''}`}
          >
            {t('Description')}
          </button>
          {locationInfo.actions.length > 0 && (
            <button
              data-qa="debug-code-tab"
              data-code-type="action"
              onClick={() => setSelectedCodeType('action')}
              className={`qsp-debugger-code-type-button ${selectedCodeType === 'action' ? 'active' : ''}`}
            >
              {t('Actions ({{count}})', { count: locationInfo.actions.length })}
            </button>
          )}
        </div>

        {selectedCodeType === 'action' && locationInfo.actions.length > 0 && (
          <div className="qsp-debugger-action-selector">
            <RadixSelect.Root
              value={selectedActionIndex.toString()}
              onValueChange={(value) => setSelectedActionIndex(Number(value))}
            >
              <RadixSelect.Trigger className="qsp-debugger-action-select">
                <RadixSelect.Value />
                <RadixSelect.Icon>
                  <ChevronDownIcon />
                </RadixSelect.Icon>
              </RadixSelect.Trigger>
              <RadixSelect.Portal>
                <RadixSelect.Content className="q-select-content">
                  <RadixSelect.ScrollUpButton className="q-select-scroll-button">
                    <ChevronUpIcon />
                  </RadixSelect.ScrollUpButton>
                  <RadixSelect.Viewport>
                    {locationInfo.actions.map((_, index) => (
                      <RadixSelect.Item key={index} value={index.toString()} className="q-select-item">
                        <RadixSelect.ItemText>
                          {locationInfo.actionNames[index]?.trim() || t('Action {{number}}', { number: index + 1 })}
                        </RadixSelect.ItemText>
                        <RadixSelect.ItemIndicator className="q-select-item-indicator">
                          <CheckIcon />
                        </RadixSelect.ItemIndicator>
                      </RadixSelect.Item>
                    ))}
                  </RadixSelect.Viewport>
                  <RadixSelect.ScrollDownButton className="q-select-scroll-button">
                    <ChevronDownIcon />
                  </RadixSelect.ScrollDownButton>
                </RadixSelect.Content>
              </RadixSelect.Portal>
            </RadixSelect.Root>
          </div>
        )}
      </div>

      <div className="qsp-debugger-monaco-container">
        <MonacoCodeViewer
          code={display.code}
          language={display.language}
          theme="vs" // Use light theme to match qSpider
          height="100%"
          currentLine={getCurrentLine()}
          targetLine={getTargetLine()}
          title={getTitle()}
          locationName={debugState.selectedLocation}
          actionIndex={selectedCodeType === 'action' ? selectedActionIndex : undefined}
          breakpoints={debugState.breakpoints}
          onBreakpointToggle={handleBreakpointToggle}
          forceUpdate={forceUpdate}
        />
      </div>
    </div>
  );
};

/** The editor alone, for code that has no tabs and no breakpoints (a current action, a step's code). */
const CodeEditor: React.FC<{ code: string; language: string; title: string; currentLine?: number }> = ({
  code,
  language,
  title,
  currentLine,
}) => (
  <div className="qsp-debugger-code-viewer">
    <div className="qsp-debugger-monaco-container">
      <MonacoCodeViewer
        code={code}
        language={language}
        theme="vs"
        height="100%"
        currentLine={currentLine}
        title={title}
      />
    </div>
  </div>
);
