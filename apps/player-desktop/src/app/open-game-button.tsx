import React, { useCallback } from 'react';
import { dialog } from '@tauri-apps/api';
import { useTranslation } from 'react-i18next';
import { games$, goToGame } from '@qspider/game-shelf';
import { importDesktop, showError } from '@qspider/game-state';

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
      try {
        const imported = await importDesktop(filePath as string);
        for (const entry of imported) {
          games$.actions.add(entry.id, entry);
        }
        goToGame(imported[0].id);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    }
  }, [t]);
  return (
    <button className="q-button" onClick={selectGame}>
      {t('Open game')}
    </button>
  );
};
