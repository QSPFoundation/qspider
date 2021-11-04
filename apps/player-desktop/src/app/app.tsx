import React, { useEffect, useRef, useState } from 'react';
import { Global, css } from '@emotion/react';
import { BaseLayoutProvider, ComponentsProvider, GameManagerProvider, ResourceProvider } from '@qspider/providers';
import { ResourceManager } from '@qspider/resources';
import { BaseLayout, GameManager, Theme } from '@qspider/core';
import { Game, GameListDialog, PlayerMode } from '@qspider/player-ui';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';
import { event, path } from '@tauri-apps/api/index.js';
import { isSupportedFileType, openGameFromDisk } from './utils';
import { FileDropArea } from './file-drop-area';
import { Icon, IconType } from '@qspider/icons';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};

export const App: React.FC = () => {
  const [resources] = useState(() => new ResourceManager());
  const [manager] = useState(() => new GameManager(resources));
  const [layout] = useState(() => new BaseLayout(manager, resources));

  const [isFileDropHovered, setIsFileDropHovered] = useState(false);
  const [unsupportedType, setUnsupportedType] = useState('');

  useEffect(() => {
    console.log('here !!!!');
    let fileDropUnlisten: event.UnlistenFn;
    let fileDropHoverUnlisten: event.UnlistenFn;
    let fileDropCancelledUnlisten: event.UnlistenFn;
    const setupCallbacks = async (): Promise<void> => {
      fileDropUnlisten = await event.listen<string[]>('tauri://file-drop', (e) => {
        const [filePath] = e.payload;
        if (isSupportedFileType(filePath)) {
          openGameFromDisk(filePath, manager);
        }
        setIsFileDropHovered(false);
      });
      fileDropHoverUnlisten = await event.listen<string[]>('tauri://file-drop-hover', async (e) => {
        const [filePath] = e.payload;
        if (!isSupportedFileType(filePath)) {
          setUnsupportedType(await path.extname(filePath));
        }
        setIsFileDropHovered(true);
      });
      fileDropCancelledUnlisten = await event.listen('tauri://file-drop-cancelled', () => {
        setIsFileDropHovered(false);
        setUnsupportedType('');
      });
    };
    setupCallbacks();
    return (): void => {
      fileDropUnlisten();
      fileDropHoverUnlisten();
      fileDropCancelledUnlisten();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {isFileDropHovered ? (
                <FileDropArea className={unsupportedType ? 'disabled' : ''}>
                  {unsupportedType ? (
                    `File extension ${unsupportedType} is not supported`
                  ) : (
                    <div>
                      <Icon icon={IconType.upload} />
                      <br /> Drop file to start game
                    </div>
                  )}
                </FileDropArea>
              ) : null}
            </Theme>
          </BaseLayoutProvider>
        </GameManagerProvider>
      </ResourceProvider>
    </ComponentsProvider>
  );
};
