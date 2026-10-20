import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { games$, goToGame } from '@qspider/game-shelf';
import { showError, showNotice } from '@qspider/game-state';
import { importDesktop, pickGameFile } from '@qspider/desktop';

export const OpenGameButton: React.FC = () => {
  const { t } = useTranslation();
  const selectGame = useCallback(async () => {
    const filePath = await pickGameFile();
    if (filePath) {
      try {
        const imported = await importDesktop(filePath);
        for (const entry of imported) {
          games$.actions.add(entry.id, entry);
        }
        if (imported.length > 1) {
          showNotice(
            t(`{{ count }} games added to shelf`, {
              count: imported.length,
            }),
          );
        } else if (imported.length === 1) {
          goToGame(imported[0].id);
        }
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
