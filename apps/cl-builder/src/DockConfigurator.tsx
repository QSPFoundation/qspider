import { useAtom, useSetup } from '@xoid/react';
import { PaneConfigurator } from './PaneConfigurator';
import { addPane, dockToConfigure$, dockToConfigureData$, updateDockSize } from './store';

export const DockConfigurator: React.FC = () => {
  const dockToConfigure = useAtom(dockToConfigure$);
  const dockData = useAtom(dockToConfigureData$);
  if (!dockToConfigure || !dockData) return null;
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = parseInt(event.target.value, 10);
    updateDockSize(dockToConfigure.index, dockToConfigure.type, value);
  };
  return (
    <div>
      <h5>
        Configuring {dockToConfigure.type} dock on layer {dockToConfigure.index}{' '}
      </h5>
      <label>
        Size:
        <input type="number" value={dockData.size} onChange={onChange} />
      </label>
      <br />
      Panes: <br />
      {dockData.panes.map((pane, index) => (
        <PaneConfigurator
          pane={pane}
          paneIndex={index}
          key={index}
          index={dockToConfigure.index}
          type={dockToConfigure.type}
        />
      ))}
      <button type="button" onClick={() => addPane(dockToConfigure.index, dockToConfigure.type)}>
        Add pane
      </button>
    </div>
  );
};
