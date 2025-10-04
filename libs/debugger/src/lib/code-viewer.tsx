import { useAtom } from '@xoid/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixSelect from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {
  debugState$,
  debugActions,
  codeInspectorActions,
  type LocationInfo,
} from '@qspider/game-state';
import { MonacoCodeViewer } from './monaco-code-viewer';

export const CodeViewer: React.FC = () => {
  const { t } = useTranslation();
  const debugState = useAtom(debugState$);
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
      const recordChanged = lastCurrentRecord?.loc !== debugState.currentRecord.loc ||
                           lastCurrentRecord?.line !== debugState.currentRecord.line ||
                           lastCurrentRecord?.actIndex !== debugState.currentRecord.actIndex;

      if (recordChanged) {
        setLastCurrentRecord(debugState.currentRecord);
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
  }, [debugState.currentRecord, debugState.isEnabled, lastCurrentRecord]);

  useEffect(() => {
    if (debugState.selectedLocation) {
      // Special case for EXEC Link - show the code directly without fetching
      if (debugState.selectedLocation === '[EXEC Link]') {
        setLocationInfo({
          name: '[EXEC Link]',
          code: debugState.currentRecord?.code ? [debugState.currentRecord.code] : [],
          actions: [],
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
    if (!debugState.currentRecord || debugState.currentRecord.loc !== debugState.selectedLocation) {
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

  const getCodeToDisplay = (): string => {
    if (selectedCodeType === 'location') {
      return locationInfo.code.join('\n') || t('// No location code');
    } else if (selectedCodeType === 'description') {
      return locationInfo.description || t('// No location description');
    } else {
      const action = locationInfo.actions[selectedActionIndex];
      return action ? action.join('\n') : t('// Empty action');
    }
  };

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
            onClick={() => setSelectedCodeType('location')}
            className={`qsp-debugger-code-type-button ${selectedCodeType === 'location' ? 'active' : ''}`}
          >
            {t('Location Code')}
          </button>
          <button
            onClick={() => setSelectedCodeType('description')}
            className={`qsp-debugger-code-type-button ${selectedCodeType === 'description' ? 'active' : ''}`}
          >
            {t('Description')}
          </button>
          {locationInfo.actions.length > 0 && (
            <button
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
                        <RadixSelect.ItemText>{t('Action {{number}}', { number: index + 1 })}</RadixSelect.ItemText>
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
          code={getCodeToDisplay()}
          language={selectedCodeType === 'description' ? 'html' : 'qsp'} // HTML for description, QSP for QSP code
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