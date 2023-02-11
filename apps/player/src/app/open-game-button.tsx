import { games$, storage$ } from '@qspider/game-state';
import { cyrb53 } from '@qspider/utils';
import { ChangeEvent, useCallback } from 'react';

export const OpenGameButton: React.FC = () => {
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = cyrb53(file.name);
    const existingGame = games$.value[id];
    if (!existingGame) {
      games$.actions.add(id, {
        id,
        title: file.name.slice(file.name.lastIndexOf('/') + 1),
        mode: file.name.endsWith('aqsp') ? 'aero' : 'classic',
        file: file.name,
      });
    }

    const reader = new FileReader();
    reader.onload = function (evt): void {
      const content = evt.target?.result as ArrayBuffer;
      storage$.value?.addGameSource(id, content);
    };
    reader.readAsArrayBuffer(file);
  }, []);
  return (
    <label className="q-button q-open-game-button" htmlFor="openGame">
      Open game
      <input type="file" id="openGame" accept=".zip, .aqsp, .qsp, .qsps, .rar" onChange={onChange} />
    </label>
  );
};
