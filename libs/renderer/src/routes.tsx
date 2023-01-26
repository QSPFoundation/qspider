import { basename$, initDefered$, runGame } from '@qspider/game-state';
import { createBrowserRouter } from 'react-router-dom';
import { GameRunner } from './game-runner';
import { GameShelf } from './game-shelf';
import { QspCatalog } from './qsp-catalog';
import { QspiderPlayer } from './qspider-player';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <QspiderPlayer />,
      children: [
        {
          path: '/catalog',
          element: <QspCatalog />,
        },
        {
          path: '/',
          element: <GameShelf />,
        },
      ],
    },
    {
      path: '/game/:id',
      element: <GameRunner />,
      async loader({ params }): Promise<null> {
        const id = params['id'];
        if (!id) return null;
        await initDefered$.value.promise;
        await runGame(id);
        return null;
      },
    },
  ],
  {
    basename: basename$.value,
  }
);
