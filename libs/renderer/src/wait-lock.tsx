import React from 'react';
import { useAtom } from '@xoid/react';
import { finishWait, wait$ } from '@qspider/game-state';
import { useEventListener } from './hooks/event-listener';

export const WaitLock: React.FC = () => {
  const wait = useAtom(wait$);
  useEventListener(
    'keypress',
    (e: KeyboardEvent) => {
      if (wait$.value) {
        e.preventDefault();
        e.stopPropagation();
        finishWait();
      }
    },
    document,
  );
  if (!wait) return null;

  return <div className="wait-lock" onClick={finishWait} />;
};
