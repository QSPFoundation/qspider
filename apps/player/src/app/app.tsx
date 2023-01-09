import { ProvidedComponents } from '@qspider/contracts';
import { baseInit$ } from '@qspider/game-state';
import { ComponentsProvider } from '@qspider/providers';
import { ErrorAlert, NoticeToast, router } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { RouterProvider } from 'react-router-dom';
import { init } from './init';
import { OpenGameButton } from './open-game-button';

import './theme.css';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};

init();

export const App: React.FC = () => {
  const initialized = useAtom(baseInit$);
  if (!initialized) return <>loading</>;
  return (
    <ComponentsProvider value={components}>
      <RouterProvider router={router} />
      <ErrorAlert />
      <NoticeToast />
    </ComponentsProvider>
  );
};
