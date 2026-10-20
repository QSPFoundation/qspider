import React, { Suspense, useEffect, useState } from 'react';
import { OpenGameButton } from './open-game-button';
import { ProvidedComponents } from '@qspider/contracts';

import { addImported } from './add-imported';
import { isSupportedFileType } from './utils';

import { init } from './init';
import { QspiderLoader, QspiderRoot } from '@qspider/renderer';
import { baseInit$, componentsRegistry$, currentGame$, showError, stopCurrentGame } from '@qspider/game-state';
import { extname, importDesktop, onFileDrop } from '@qspider/desktop';
import { useAtom } from '@xoid/react';

import './desktop.css';
import { ErrorAlert, goToGame, NoticeToast, PlayerWithShelf, StartupMarker } from '@qspider/game-shelf';
import { useTranslation } from 'react-i18next';

componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGameButton);
init();

export const App: React.FC = () => {
  const { t } = useTranslation();
  const [isFileDropHovered, setIsFileDropHovered] = useState(false);
  const [unsupportedType, setUnsupportedType] = useState('');
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let disposed = false;

    onFileDrop({
      onHover: async (filePath) => {
        if (!isSupportedFileType(filePath)) {
          setUnsupportedType(await extname(filePath));
        }
        setIsFileDropHovered(true);
      },
      onDrop: async (filePath) => {
        if (isSupportedFileType(filePath)) {
          try {
            const imported = await importDesktop(filePath);
            const toRun = addImported(imported, t);
            if (toRun) {
              if (currentGame$.value) {
                stopCurrentGame();
              }
              goToGame(toRun);
            }
          } catch (err) {
            showError(err instanceof Error ? err.message : String(err));
          }
        }
        setIsFileDropHovered(false);
      },
      onCancel: () => {
        setIsFileDropHovered(false);
        setUnsupportedType('');
      },
    }).then((fn) => {
      if (disposed) fn();
      else unlisten = fn;
    });
    return (): void => {
      disposed = true;
      unlisten?.();
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
        <StartupMarker />
      </QspiderRoot>
      {isFileDropHovered ? (
        <div className={unsupportedType ? 'file-drop-area disabled' : 'file-drop-area'}>
          {unsupportedType ? `File extension ${unsupportedType} is not supported` : <div>Drop file to start game</div>}
        </div>
      ) : null}
    </Suspense>
  );
};
