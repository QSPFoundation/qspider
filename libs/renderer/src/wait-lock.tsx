import React from 'react';
import { hooks } from '@qspider/components';
import { useAtom } from '@xoid/react';
import { finishWait, wait$ } from '@qspider/game-state';

export const WaitLock: React.FC = () => {
  const wait = useAtom(wait$);
  hooks.useEventListener(
    'keypress',
    (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      finishWait();
    },
    document
  );
  if (!wait) return null;

  return <div className="wait-lock" onClick={finishWait} />;
};
