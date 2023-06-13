import { ProvidedComponents } from '@qspider/contracts';
import { PlayerWithShelf } from '@qspider/game-shelf';
import { baseInit$, componentsRegistry$, showNotice } from '@qspider/game-state';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { Suspense } from 'react';
import { init } from './init';
import { OpenGameButton } from './open-game-button';

componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGameButton);
init();
showNotice('test message');

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return (
    <Suspense fallback={<QspiderLoader />}>
      <QspiderRoot>
        <PlayerWithShelf />
      </QspiderRoot>
    </Suspense>
  );
};
