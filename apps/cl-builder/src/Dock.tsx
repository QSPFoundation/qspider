import { useAtom } from '@xoid/react';
import { Fragment } from 'react';
import { Pane } from './Pane';
import { PaneResizeHandle } from './PaneResizeHandle';
import {
  addDock,
  configureDock,
  dockToConfigure$,
  DockType,
  getDockDimension,
  LayerDock,
  mode$,
  removeDock,
} from './store';

interface DockProps {
  type: DockType;
  index: number;
  data?: LayerDock;
}

export const Dock: React.FC<DockProps> = (props) => {
  const mode = useAtom(mode$);
  return mode === 'edit' ? <EditDock {...props} /> : <PreviewDock {...props} />;
};

export const PreviewDock: React.FC<DockProps> = ({ type, index, data }) => {
  if (!data) return null;
  const dimension = getDockDimension(type);
  const className = `dock ${type}`;
  return (
    <div className={className} style={{ [dimension]: data.size }}>
      {data.panes.map((pane, paneIndex) => (
        <Pane
          data={pane}
          key={pane.type + paneIndex}
          index={index}
          type={type}
          paneIndex={paneIndex}
          canRemove={data.panes.length > 1}
        />
      ))}
    </div>
  );
};

export const EditDock: React.FC<DockProps> = ({ type, index, data }) => {
  const dimension = getDockDimension(type);
  const className = ['dock', type];
  const dockToConfigure = useAtom(dockToConfigure$);

  const isCurrentlyConfigured = dockToConfigure?.index === index && dockToConfigure?.type === type;
  if (isCurrentlyConfigured) className.push('dock-configured');
  if (!data) {
    return (
      <div className="dock">
        <button className="add-dock-button" onClick={(): void => addDock(index, type)}>
          +
        </button>
      </div>
    );
  }
  return (
    <div id={`dock-${index}-${type}`} className={className.join(' ')} style={{ [dimension]: data.size }}>
      <div className="dock-buttons">
        <button onClick={(): void => configureDock(index, type)}>Configure</button>
        <button onClick={(): void => removeDock(index, type)}>Remove</button>
      </div>
      {data.panes.map((pane, paneIndex) => (
        <Fragment key={pane.type + paneIndex}>
          <Pane data={pane} index={index} type={type} paneIndex={paneIndex} canRemove={data.panes.length > 1} />
          {paneIndex < data.panes.length - 1 ? (
            <PaneResizeHandle
              data={pane}
              nextData={data.panes[paneIndex + 1]}
              type={type}
              index={index}
              paneIndex={paneIndex}
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
};
