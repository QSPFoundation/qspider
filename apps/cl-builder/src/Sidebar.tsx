import { useAtom } from '@xoid/react';
import { DockConfigurator } from './DockConfigurator';
import { addLayer, isViewFloating$, maxLayerIndex$, mode$, toggleMode } from './store';

export const Sidebar: React.FC = () => {
  const isViewFloating = useAtom(isViewFloating$);
  const maxLayerIndex = useAtom(maxLayerIndex$);
  const mode = useAtom(mode$);

  return (
    <aside className="p-2">
      Current mode: {mode}
      <br />
      <button onClick={toggleMode}>Toggle mode</button>
      <br />
      <hr />
      <label>
        Is View panel floating:&nbsp;
        <input type="checkbox" checked={isViewFloating} onChange={(): void => isViewFloating$.update((v) => !v)} />
      </label>
      <div>Max Layer Index: {maxLayerIndex}</div>
      <div>
        <button type="button" onClick={addLayer}>
          Add Layer
        </button>
      </div>
      <DockConfigurator />
    </aside>
  );
};
