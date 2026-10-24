import { useAtom } from '@xoid/react';
import { GameRunner, QspiderLoader, QspiderRoot, StartupMarker } from '@qspider/renderer';
import { baseInit$ } from '@qspider/game-state';
import { init } from './init';
import { Suspense } from 'react';

init();

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return (
    <Suspense fallback={<QspiderLoader />}>
      <QspiderRoot>
        <GameRunner />
        <StartupMarker />
      </QspiderRoot>
    </Suspense>
  );
};
