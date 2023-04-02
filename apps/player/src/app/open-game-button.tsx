import { games$, goToGame } from '@qspider/game-shelf';
import { extractGameDescriptor, storage$ } from '@qspider/game-state';
import { cyrb53 } from '@qspider/utils';
import { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const OpenGameButton: React.FC = () => {
  const { t } = useTranslation();
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (evt): Promise<void> {
      const content = evt.target?.result as ArrayBuffer;
      let descriptor = await extractGameDescriptor(content);
      if (!descriptor) {
        descriptor = {
          id: cyrb53(file.name),
          title: file.name.slice(file.name.lastIndexOf('/') + 1),
          mode: file.name.endsWith('aqsp') ? 'aero' : 'classic',
          file: file.name,
        };
      }
      games$.actions.add(descriptor.id, descriptor);
      await storage$.value?.addGameSource(descriptor.id, content);
      goToGame(descriptor.id);
    };
    reader.readAsArrayBuffer(file);
  }, []);
  return (
    <label className="q-button q-open-game-button" htmlFor="openGame">
      {t('Open game')}
      <input type="file" id="openGame" accept=".zip, .aqsp, .qsp, .qsps, .rar" onChange={onChange} />
    </label>
  );
};
