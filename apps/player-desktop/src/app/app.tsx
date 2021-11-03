import React, { useRef } from 'react';
import { Global, css } from '@emotion/react';
import { BaseLayoutProvider, ComponentsProvider, GameManagerProvider, ResourceProvider } from '@qspider/providers';
import { ResourceManager } from '@qspider/resources';
import { BaseLayout, GameManager, Theme } from '@qspider/core';
import { Game, GameListDialog, PlayerMode } from '@qspider/player-ui';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';

export const App: React.FC = () => {
  const resources = useRef(new ResourceManager());
  const manager = useRef(new GameManager(resources.current));
  const layout = useRef(new BaseLayout(manager.current, resources.current));
  const components = useRef({
    [ProvidedComponents.OpenGameButton]: OpenGameButton,
  });
  return (
    <ComponentsProvider value={components.current}>
      <ResourceProvider value={resources.current}>
        <GameManagerProvider value={manager.current}>
          <BaseLayoutProvider value={layout.current}>
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
