import { useAtom } from '@xoid/react';
import { availablePanes$, changePaneProportion, changePaneType, DockPane, DockType, PaneType } from './store';

const labels: Record<PaneType, string> = {
  objs: 'Objects',
  vars: 'Additional description',
  acts: 'Actions',
  input: 'User command',
  imgview: 'View',
};

export const PaneConfigurator: React.FC<{
  pane: DockPane;
  index: number;
  type: DockType;
  paneIndex: number;
}> = ({ pane, index, type, paneIndex }) => {
  const onTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    changePaneType(index, type, paneIndex, event.target.value as PaneType);
  };
  const onProportionChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    changePaneProportion(index, type, paneIndex, parseInt(event.target.value, 10));
  };
  const availablePanes = [...useAtom(availablePanes$)];
  if (pane.type !== 'unknown') {
    availablePanes.push(pane.type);
  }
  return (
    <div>
      <label>
        Type:
        <select value={pane.type} onChange={onTypeChange}>
          <option value="unknown">Unselected</option>
          {availablePanes.map((t) => (
            <option value={t} key={t}>
              {labels[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Proportion: <input type="number" value={pane.proportion} onChange={onProportionChange} />
      </label>
    </div>
  );
};
