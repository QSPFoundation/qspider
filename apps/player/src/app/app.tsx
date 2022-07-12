import React, { useEffect } from 'react';
import { Global, css } from '@emotion/react';
import { BaseLayoutProvider, ComponentsProvider, GameManagerProvider, ResourceProvider } from '@qspider/providers';
import { ResourceManager } from '@qspider/resources';
import { BaseLayout, GameManager, Theme } from '@qspider/core';
import { Game, GameListDialog } from '@qspider/player-ui';
import { ProvidedComponents } from '@qspider/contracts';
import { OpenGameButton } from './open-game-button';
import { windowManager } from './window-manager';
import { PlayerMode } from './player-mode';
import { cyrb53 } from '@qspider/utils';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};
const resources = new ResourceManager();
const manager = new GameManager(resources, windowManager);
const layout = new BaseLayout(manager, resources);

export const App: React.FC = () => {
  useEffect(() => {
    const init = async (): Promise<void> => {
      await manager.initialize();

      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const configUrl = urlParams.get('config');
      const gameUrl = urlParams.get('game');
      if (configUrl) {
        manager.runConfig(configUrl);
      } else if (gameUrl) {
        manager.openGameDescriptor(
          {
            id: cyrb53(gameUrl),
            mode: gameUrl.endsWith('aqsp') ? 'aero' : 'classic',
            title: '',
            file: gameUrl,
          },
          false
        );
      } else {
        manager.runConfig();
      }
    };
    init();
  }, []);

  return (
    <ComponentsProvider value={components}>
      <ResourceProvider value={resources}>
        <GameManagerProvider value={manager}>
          <BaseLayoutProvider value={layout}>
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
          </BaseLayoutProvider>
        </GameManagerProvider>
      </ResourceProvider>
    </ComponentsProvider>
  );
};
