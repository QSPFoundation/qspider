import React, { Suspense, useEffect, useState } from 'react';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';
import { event, path } from '@tauri-apps/api';

import { isSupportedFileType } from './utils';

import { init } from './init';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { baseInit$, componentsRegistry$, importDesktop } from '@qspider/game-state';
import { useAtom } from '@xoid/react';

import './desktop.css';
import { games$, goToGame, PlayerWithShelf } from '@qspider/game-shelf';

componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGameButton);
init();

export const App: React.FC = () => {
  const [isFileDropHovered, setIsFileDropHovered] = useState(false);
  const [unsupportedType, setUnsupportedType] = useState('');
  useEffect(() => {
    let fileDropUnlisten: event.UnlistenFn | null = null;
    let fileDropHoverUnlisten: event.UnlistenFn | null = null;
    let fileDropCancelledUnlisten: event.UnlistenFn | null = null;

    const setupCallbacks = async (): Promise<void> => {
      fileDropUnlisten = await event.listen<string[]>('tauri://file-drop', async (e) => {
        const [filePath] = e.payload;
        if (isSupportedFileType(filePath)) {
          const imported = await importDesktop(filePath);
          for (const entry of imported) {
            if (!games$.value[entry.id]) {
              games$.actions.add(entry.id, entry);
            }
          }
          const toRun = imported[0].id;
          toRun && goToGame(toRun);
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
      fileDropUnlisten?.();
      fileDropHoverUnlisten?.();
      fileDropCancelledUnlisten?.();
    };
  }, []);

  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return (
    <Suspense fallback={<QspiderLoader />}>
      <QspiderRoot>
        <PlayerWithShelf />
      </QspiderRoot>
      {isFileDropHovered ? (
        <div className={unsupportedType ? 'file-drop-area disabled' : 'file-drop-area'}>
          {unsupportedType ? `File extension ${unsupportedType} is not supported` : <div>Drop file to start game</div>}
        </div>
      ) : null}
    </Suspense>
  );
};
