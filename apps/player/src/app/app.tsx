import { ProvidedComponents } from '@qspider/contracts';
import { baseInit$, componentsRegistry$ } from '@qspider/game-state';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { init } from './init';
import { OpenGameButton } from './open-game-button';

componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGameButton);
init();

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return <QspiderRoot />;
};
