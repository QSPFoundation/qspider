import { useEffect, lazy, Suspense } from 'react';
import { useAtom } from '@xoid/react';
import { currentGameEntry$, isDebugPanelOpen$, debugDockPosition$, debugActions } from '@qspider/game-state';
import './debugger.css';

const DebugPanel = lazy(() => import('./debug-panel').then((module) => ({ default: module.DebugPanel })));

export type DockPosition = 'bottom' | 'left' | 'right';

export const Debugger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentGameEntry = useAtom(currentGameEntry$);
  const isDebugPanelOpen = useAtom(isDebugPanelOpen$);
  const dockPosition = useAtom(debugDockPosition$);

  // Close debugger panel when game stops
  useEffect(() => {
    if (!currentGameEntry) {
      debugActions.closeDebugPanel();
    }
  }, [currentGameEntry]);

  // Keyboard shortcut to toggle debugger (F12 like Chrome DevTools)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Only allow debugger when game is running
      if (!currentGameEntry) return;

      if (e.key === 'F12') {
        e.preventDefault();
        debugActions.toggleDebugPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGameEntry]);

  return (
    <div
      className={`qsp-debugger-layout ${isDebugPanelOpen ? 'debugger-open' : ''} ${isDebugPanelOpen ? `debugger-${dockPosition}` : ''}`}
    >
      <div className="qsp-debugger-main-content">{children}</div>
      {isDebugPanelOpen && currentGameEntry && (
        <Suspense fallback={<div className="qsp-debugger-loading">Loading debugger...</div>}>
          <DebugPanel />
        </Suspense>
      )}
    </div>
  );
};
