import React, { useCallback } from 'react';
import { dialog } from '@tauri-apps/api';
import { useTranslation } from 'react-i18next';
import { games$, goToGame } from '@qspider/game-shelf';
import { importDesktop } from '@qspider/game-state';

export const OpenGameButton: React.FC = () => {
  const { t } = useTranslation();
  const selectGame = useCallback(async () => {
    const filePath = await dialog.open({
      multiple: false,
      filters: [
        {
          name: 'Qsp files',
          extensions: ['qsp', 'qsps', 'aqsp', 'zip', 'rar'],
        },
      ],
    });
    if (filePath) {
      const imported = await importDesktop(filePath as string);
      for (const entry of imported) {
        if (!games$.value[entry.id]) {
          games$.actions.add(entry.id, entry);
        }
      }
      goToGame(imported[0].id);
    }
  }, []);
  return (
    <button className="q-button" onClick={selectGame}>
      {t('Open game')}
    </button>
  );
};
