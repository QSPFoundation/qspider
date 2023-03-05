import { useAtom } from '@xoid/react';
import { DockPane, DockType, mode$, removePane } from './store';

interface PaneProps {
  index: number;
  type: DockType;
  paneIndex: number;
  data: DockPane;
  canRemove: boolean;
}

export const Pane: React.FC<PaneProps> = (props) => {
  const mode = useAtom(mode$);
  return mode === 'edit' ? <EditPane {...props} /> : <PreviewPane {...props} />;
};

export const PreviewPane: React.FC<PaneProps> = ({ data }) => {
  const style = {
    flexGrow: data.proportion,
  };
  return (
    <div className="pane" style={style}>
      {data.type}
    </div>
  );
};

export const EditPane: React.FC<PaneProps> = ({ data, index, type, paneIndex, canRemove }) => {
  const style = {
    flexGrow: data.proportion,
  };
  return (
    <div className="pane" style={style}>
      <div className="pane-buttons">
        {canRemove && (
          <button type="button" onClick={() => removePane(index, type, paneIndex)}>
            Remove
          </button>
        )}
      </div>
      {data.type}
    </div>
  );
};
