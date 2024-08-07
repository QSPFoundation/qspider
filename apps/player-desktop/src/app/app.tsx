import React, { Suspense, useEffect, useState } from 'react';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';
import { event, path } from '@tauri-apps/api';

import { isSupportedFileType } from './utils';

import { init } from './init';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { baseInit$, componentsRegistry$, currentGame$, showError, stopCurrentGame } from '@qspider/game-state';
import { importDesktop } from '@qspider/importers';
import { useAtom } from '@xoid/react';

import './desktop.css';
import { ErrorAlert, games$, goToGame, NoticeToast, PlayerWithShelf } from '@qspider/game-shelf';
import { useTranslation } from 'react-i18next';

componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGameButton);
init();

export const App: React.FC = () => {
  const { t } = useTranslation();
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
          try {
            const imported = await importDesktop(filePath);
            for (const entry of imported) {
              if (!games$.value[entry.id]) {
                games$.actions.add(entry.id, entry);
              }
            }
            if (currentGame$.value) {
              stopCurrentGame();
            }
            const toRun = imported[0].id;
            toRun && goToGame(toRun);
          } catch (err) {
            showError(err instanceof Error ? err.message : String(err));
          }
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
  }, [t]);

  const initialized = useAtom(baseInit$);
  if (!initialized) return <QspiderLoader />;
  return (
    <Suspense fallback={<QspiderLoader />}>
      <QspiderRoot>
        <PlayerWithShelf />
        <ErrorAlert />
        <NoticeToast />
      </QspiderRoot>
      {isFileDropHovered ? (
        <div className={unsupportedType ? 'file-drop-area disabled' : 'file-drop-area'}>
          {unsupportedType ? `File extension ${unsupportedType} is not supported` : <div>Drop file to start game</div>}
        </div>
      ) : null}
    </Suspense>
  );
};
