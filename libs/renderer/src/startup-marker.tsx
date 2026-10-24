import React from 'react';
import { useAtom } from '@xoid/react';
import { startupFinished$ } from '@qspider/game-state';

/** An empty, hidden marker present once startup has fully run (startupFinished$), for automation. */
export const StartupMarker: React.FC = () => {
  const finished = useAtom(startupFinished$);
  return finished ? <div data-qa="startup-finished" hidden /> : null;
};
