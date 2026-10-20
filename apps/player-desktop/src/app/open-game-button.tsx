import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { goToGame } from '@qspider/game-shelf';
import { showError } from '@qspider/game-state';
import { addImported } from './add-imported';
import { importDesktop, pickGameFile } from '@qspider/desktop';

export const OpenGameButton: React.FC = () => {
  const { t } = useTranslation();
  const selectGame = useCallback(async () => {
    const filePath = await pickGameFile();
    if (filePath) {
      try {
        const imported = await importDesktop(filePath);
        const toRun = addImported(imported, t);
        if (toRun) goToGame(toRun);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    }
  }, [t]);
  return (
    <button className="q-button" data-qa="open-game" onClick={selectGame}>
      {t('Open game')}
    </button>
  );
};
