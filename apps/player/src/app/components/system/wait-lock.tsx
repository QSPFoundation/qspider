import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useEventListener } from '../../hooks/event-listener';
import styled from '@emotion/styled';

const Lock = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

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

  return <Lock onClick={onClick} />;
});
