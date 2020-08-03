import React from 'react';
import { Global, css } from '@emotion/core';

import { GameManagerProvider } from './game/manager';
import { LayoutProvider } from './game/layout';
import { Game } from './game';
import { Theme } from './game/theme';
import { Player } from './components/player';

export const App: React.FC = () => {
  return (
    <GameManagerProvider>
      <LayoutProvider>
        <Theme>
          <Global
            styles={css`
              body {
                margin: 0;
              }
              *,
              *:before,
              *:after {
                box-sizing: border-box;
              }
            `}
          />
          <Game>
            <Player />
          </Game>
        </Theme>
      </LayoutProvider>
    </GameManagerProvider>
  );
};
