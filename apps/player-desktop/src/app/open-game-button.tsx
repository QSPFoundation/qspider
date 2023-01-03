import React, { useCallback } from 'react';
import { dialog } from '@tauri-apps/api';
import { prepareGameFromDisk } from './utils';
import { runGame } from '@qspider/game-state';

export const OpenGameButton: React.FC = () => {
  const selectGame = useCallback(async () => {
    const file_path = await dialog.open({
      filters: [
        {
          name: 'Qsp files',
          extensions: ['qsp', 'qsps', 'aqsp', 'zip', 'rar'],
        },
      ],
    });
    if (file_path) {
      const id = await prepareGameFromDisk(file_path as string);
      runGame(id);
    }
  }, []);
  return <div onClick={selectGame}>Open game</div>;
};
