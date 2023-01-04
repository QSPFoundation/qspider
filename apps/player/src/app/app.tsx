import { ProvidedComponents } from '@qspider/contracts';
import { baseInit$, currentGame$ } from '@qspider/game-state';
import { ComponentsProvider } from '@qspider/providers';
import { ErrorAlert, GameRunner, GameShelf, NoticeToast } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { init } from './init';
import { OpenGameButton } from './open-game-button';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};

init();

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  const currentGame = useAtom(currentGame$);
  if (!initialized) return <>loading</>;
  return (
    <ComponentsProvider value={components}>
      {currentGame ? <GameRunner /> : <GameShelf />}
      <ErrorAlert />
      <NoticeToast />
    </ComponentsProvider>
  );
};
