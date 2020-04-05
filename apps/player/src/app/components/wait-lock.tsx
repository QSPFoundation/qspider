import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../game/manager';
import { useEventListener } from '../hooks/event-listener';
import { Pane } from 'evergreen-ui';

export const WaitLock: React.FC = observer(() => {
  const manager = useGameManager();
  const onClick = useCallback(() => {
    if (manager.isWaiting) {
      manager.completeWaiting();
    }
  }, [manager]);
  useEventListener(
    'keypress',
    (e: KeyboardEvent) => {
      if (manager.isWaiting) {
        e.preventDefault();
        e.stopPropagation();
        manager.completeWaiting();
      }
    },
    document
  );
  if (!manager.isWaiting) return null;

  return (
    <Pane
      position="fixed"
      top={0}
      bottom={0}
      left={0}
      right={0}
      onClick={onClick}
    />
  );
});
