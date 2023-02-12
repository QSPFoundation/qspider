import React, { useCallback } from 'react';
import { dialog } from '@tauri-apps/api';
import { prepareGameFromDisk } from './utils';
import { goToGame } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';

export const OpenGameButton: React.FC = () => {
  const { t } = useTranslation();
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
      goToGame(id);
    }
  }, []);
  return (
    <button className="q-button" onClick={selectGame}>
      {t('Open game')}
    </button>
  );
};
