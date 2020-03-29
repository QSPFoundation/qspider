import React from 'react';

import './app.css';
import { Player } from './player/player';
import { Game } from './game';
import { GameManagerProvider } from './game/manager';

export const App = () => {
  return (
    <GameManagerProvider>
      <Game>
        <Player />
      </Game>
    </GameManagerProvider>
  );
};
