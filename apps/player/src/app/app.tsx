import React from 'react';
import { Global, css } from '@emotion/react';

import { GameManagerProvider } from './game/manager';
import { LayoutProvider } from './game/layout';
import { Game } from './game';
import { Theme } from './game/theme';
import { GameListDialog } from './components/dialogs/game-list/game-list.dialog';
import { ResourceProvider } from './game/resource-manager';
import { PlayerMode } from './components/player-mode';

export const App: React.FC = () => {
  return (
    <ResourceProvider>
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
              <PlayerMode />
              <GameListDialog closable={true} />
            </Game>
          </Theme>
        </LayoutProvider>
      </GameManagerProvider>
    </ResourceProvider>
  );
};
