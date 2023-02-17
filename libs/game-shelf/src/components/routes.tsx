import { basename$, initDefered$, runGame } from '@qspider/game-state';
import { GameRunner } from '@qspider/renderer';
import { createBrowserRouter } from 'react-router-dom';
import { games$ } from '../game-shelf';

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
        const descriptor = games$.value[id];
        await runGame(descriptor);
        return null;
      },
    },
  ],
  {
    basename: basename$.value,
  }
);
