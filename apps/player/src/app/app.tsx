import React from 'react';

import './app.css';
import { Player } from './player/player';
import { Game } from './game';
import { GameManagerProvider } from './game/manager';
import { LayoutProvider } from './game/layout';

export const App = () => {
  return (
    <GameManagerProvider>
      <LayoutProvider>
        <Game>
          <Player />
        </Game>
      </LayoutProvider>
    </GameManagerProvider>
  );
};
