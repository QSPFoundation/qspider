import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import { hooks } from '@qspider/components';

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
  hooks.useEventListener(
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
