import { useAtom } from '@xoid/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import {
  debugState$,
  debugActions,
  codeInspectorActions,
  isCodeInspectorLoading$,
  codeInspectorError$,
  isDebugPanelOpen$,
  debugDockPosition$,
  debugPanelSize$,
  qspApi$,
} from '@qspider/game-state';
import { TooltipButton } from './tooltip-button';
import { LocationRightPanel } from './location-right-panel';
import { CodeViewer } from './code-viewer';
import './debugger.css';

export type DockPosition = 'bottom' | 'left' | 'right';

export const DebugPanel: React.FC = () => {
  const { t } = useTranslation();
  const qspApi = useAtom(qspApi$);
  const debugState = useAtom(debugState$);
  const isLoading = useAtom(isCodeInspectorLoading$);
  const error = useAtom(codeInspectorError$);
  const isOpen = useAtom(isDebugPanelOpen$);
  const position = useAtom(debugDockPosition$);
  const size = useAtom(debugPanelSize$);
  const [isResizing, setIsResizing] = useState(false);
  const buildData = useMemo(() => `(v${qspApi?.version()} - ${qspApi?.getCompiledDateTime()})`, [qspApi]);

  useEffect(() => {
    if (isOpen) {
      codeInspectorActions.refreshLocations();
    }
  }, [isOpen]);

  // No need to auto-switch tabs since there's only one tab now

  // Add keyboard shortcuts for debug controls
  useEffect(() => {
    if (!isOpen || !debugState.isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when debug panel is open and debug is enabled
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (e.key) {
        case 'F5':
          e.preventDefault();
          if (debugState.isPaused) {
            debugActions.resumeExecution();
          } else {
            debugActions.pauseExecution();
          }
          break;
        case 'F10':
          e.preventDefault();
          if (debugState.isPaused) {
            debugActions.stepExecution();
          }
          break;
        case 'F9':
          e.preventDefault();
          debugActions.pauseExecution();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, debugState.isEnabled, debugState.isPaused]);

  const handleMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent): void => {
      let newSize;
      if (position === 'bottom') {
        const newHeight = startHeight - (e.clientY - startY);
        newSize = { ...size, height: Math.max(200, Math.min(window.innerHeight * 0.8, newHeight)) };
      } else {
        const newWidth = position === 'right' ? startWidth - (e.clientX - startX) : startWidth + (e.clientX - startX);
        newSize = { ...size, width: Math.max(300, Math.min(window.innerWidth * 0.8, newWidth)) };
      }
      debugActions.setPanelSize(newSize);
    };

    const handleMouseUp = (): void => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // isOpen handled by parent conditional rendering

  const containerStyle: React.CSSProperties = {
    ...(position === 'bottom' && { height: size.height }),
    ...(position !== 'bottom' && { width: size.width }),
  };

  const handleLocationSelect = (location: string): void => {
    debugActions.selectLocation(location);
  };

  const handleAddBreakpoint = (location: string): void => {
    // Check if breakpoint already exists for this location
    const existingBreakpoint = debugState.breakpoints.find(
      (bp) => bp.location === location && bp.line === undefined && bp.actionIndex === undefined,
    );

    if (existingBreakpoint) {
      // If exists, remove it (toggle off)
      debugActions.removeBreakpoint(existingBreakpoint.id);
    } else {
      // If doesn't exist, add it (toggle on)
      debugActions.addBreakpoint({
        location,
        enabled: true,
      });
    }
  };

  return (
    <div className={`qsp-debugger-container ${position} ${!isOpen ? 'hidden' : ''}`} style={containerStyle}>
      <div className={`qsp-debugger-resizer ${isResizing ? 'resizing' : ''}`} onMouseDown={handleMouseDown} />
      <div className="qsp-debugger-header">
        <div className="qsp-debugger-title">
          {t('QSP Debugger')} {buildData}
        </div>
        <div className="qsp-debugger-header-controls">
          <RadixTooltip.Provider>
            <div className="qsp-debugger-dock-controls">
              <TooltipButton
                onClick={() => debugActions.setDockPosition('left')}
                tooltip={t('Dock to left')}
                className={`qsp-debugger-dock-button ${position === 'left' ? 'active' : ''}`}
              >
                ⬅
              </TooltipButton>
              <TooltipButton
                onClick={() => debugActions.setDockPosition('bottom')}
                tooltip={t('Dock to bottom')}
                className={`qsp-debugger-dock-button ${position === 'bottom' ? 'active' : ''}`}
              >
                ⬇
              </TooltipButton>
              <TooltipButton
                onClick={() => debugActions.setDockPosition('right')}
                tooltip={t('Dock to right')}
                className={`qsp-debugger-dock-button ${position === 'right' ? 'active' : ''}`}
              >
                ➡
              </TooltipButton>
            </div>
            <TooltipButton
              onClick={() => debugActions.closeDebugPanel()}
              tooltip={t('Close debugger panel')}
              className="qsp-debugger-close-button"
            >
              ✕
            </TooltipButton>
          </RadixTooltip.Provider>
        </div>
      </div>

      <div className="qsp-debugger-content">
        <div className="qsp-debugger-sidebar">
          <div className="qsp-debugger-locations-content">
            {isLoading && <div className="qsp-debugger-loading">{t('Loading...')}</div>}
            {error && <div className="qsp-debugger-error">{error}</div>}
            {debugState.locations.map((location) => {
              const isSelected = debugState.selectedLocation === location;
              const isCurrentExecution = debugState.currentRecord?.loc === location;
              const hasBreakpoint = debugState.breakpoints.some(
                (bp) => bp.location === location && bp.line === undefined && bp.actionIndex === undefined,
              );
              return (
                <div
                  key={location}
                  className={`qsp-debugger-location-item ${
                    isSelected ? 'selected' : ''
                  } ${isCurrentExecution ? 'current-execution' : ''}`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <span className="qsp-debugger-location-name">
                    {isCurrentExecution && <span className="execution-indicator">▶ </span>}
                    {location}
                  </span>
                  <RadixTooltip.Provider>
                    <TooltipButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBreakpoint(location);
                      }}
                      tooltip={
                        hasBreakpoint
                          ? t('Remove breakpoint from {{location}}', { location })
                          : t('Add breakpoint to {{location}}', { location })
                      }
                      className={`qsp-debugger-breakpoint-button ${hasBreakpoint ? 'has-breakpoint' : ''}`}
                    >
                      ●
                    </TooltipButton>
                  </RadixTooltip.Provider>
                </div>
              );
            })}
          </div>
        </div>

        <div className="qsp-debugger-main">
          <div className="qsp-debugger-main-with-panel">
            <div className="qsp-debugger-code-section">
              <CodeViewer />
            </div>
            <div className="qsp-debugger-right-panel-main">
              <LocationRightPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
