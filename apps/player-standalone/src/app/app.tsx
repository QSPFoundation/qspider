import { useAtom } from '@xoid/react';
import { GameRunner, QspiderLoader, QspiderRoot } from '@qspider/renderer';
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
      </QspiderRoot>
    </Suspense>
  );
};
