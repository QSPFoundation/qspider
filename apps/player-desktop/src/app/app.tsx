import React, { useEffect, useState } from 'react';
import { Global, css } from '@emotion/react';
import { BaseLayoutProvider, ComponentsProvider, GameManagerProvider, ResourceProvider } from '@qspider/providers';
import { ResourceManager } from '@qspider/resources';
import { BaseLayout, GameManager, Theme } from '@qspider/core';
import { Game, GameListDialog } from '@qspider/player-ui';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';
import { event, path, cli } from '@tauri-apps/api';
import { isSupportedFileType, openGameFromDisk } from './utils';
import { FileDropArea } from './file-drop-area';
import { Icon, IconType } from '@qspider/icons';
import { windowManager } from './window-manager';
import { PlayerMode } from './player-mode';

const components = {
  [ProvidedComponents.OpenGameButton]: OpenGameButton,
};
const resources = new ResourceManager();
const manager = new GameManager(resources, windowManager);
const layout = new BaseLayout(manager, resources);

export const App: React.FC = () => {
  const [isFileDropHovered, setIsFileDropHovered] = useState(false);
  const [unsupportedType, setUnsupportedType] = useState('');
  useEffect(() => {
    cli.getMatches().then(async (matches) => {
      await manager.initialize();
      if (matches.args.file.value) {
        try {
          const filePath = matches.args.file.value as string;
          if (await path.isAbsolute(filePath)) {
            return openGameFromDisk(filePath, manager);
          } else {
            const resolvedPath = await path.resolve(filePath);
            return openGameFromDisk(resolvedPath, manager);
          }
        } catch (err) {
          console.error(err);
        }
      }
      manager.runConfig('https://qspfoundation.github.io/qspider/game/game.cfg');
    });

    let fileDropUnlisten: event.UnlistenFn | null = null;
    let fileDropHoverUnlisten: event.UnlistenFn | null = null;
    let fileDropCancelledUnlisten: event.UnlistenFn | null = null;

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
      fileDropUnlisten && fileDropUnlisten();
      fileDropHoverUnlisten && fileDropHoverUnlisten();
      fileDropCancelledUnlisten && fileDropCancelledUnlisten();
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
