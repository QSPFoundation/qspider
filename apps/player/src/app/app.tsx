import { ProvidedComponents } from '@qspider/contracts';
import { baseInit$ } from '@qspider/game-state';
import { ComponentsProvider } from '@qspider/providers';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { init } from './init';
import { OpenGameButton } from './open-game-button';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};

init();

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return (
    <ComponentsProvider value={components}>
      <QspiderRoot />
    </ComponentsProvider>
  );
};
