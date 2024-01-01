import { useAtom, useSetup } from '@xoid/react';
import { create } from 'xoid';
import { Dock } from './Dock';
import { DockResizeHandle } from './DockResizeHandle';
import { layers$, LayoutLayer, mode$ } from './store';

interface LayerProps {
  index: number;
}

const useLayer = (props: LayerProps): LayoutLayer => {
  const layer$ = useSetup((props$) => {
    const index$ = props$.focus((s) => s.index);

    return create((get) => {
      const index = get(index$);
      const layers = get(layers$);
      return layers[index];
    });
  }, props);
  const layer = useAtom(layer$);
  return layer;
};

export const Layer: React.FC<LayerProps> = ({ index }) => {
  const mode = useAtom(mode$);
  return mode === 'edit' ? <EditLayer index={index} /> : <PreviewLayer index={index} />;
};

export const EditLayer: React.FC<LayerProps> = (props) => {
  const layer = useLayer(props);
  const { index } = props;
  return (
    <div className="layer">
      <div className="layer-index">Layer {index}</div>
      <div className="top-dock">
        <Dock type="top" data={layer.top} index={index} />
        <DockResizeHandle type="top" data={layer.top} index={index} />
      </div>
      <div className="center-row">
        <div className="left-dock">
          <Dock type="left" data={layer.left} index={index} />
          <DockResizeHandle type="left" data={layer.left} index={index} />
        </div>
        <div className="center-dock">
          {index - 1 < 0 ? <div className="dock main">Main content panel</div> : <Layer index={index - 1} />}
        </div>
        <div className="right-dock">
          <DockResizeHandle type="right" data={layer.right} index={index} />
          <Dock type="right" data={layer.right} index={index} />
        </div>
      </div>
      <div className="bottom-dock">
        <DockResizeHandle type="bottom" data={layer.bottom} index={index} />
        <Dock type="bottom" data={layer.bottom} index={index} />
      </div>
    </div>
  );
};

export const PreviewLayer: React.FC<LayerProps> = (props) => {
  const layer = useLayer(props);
  const { index } = props;

  return (
    <div className="layer">
      {layer.top && (
        <div className="top-dock">
          <Dock type="top" data={layer.top} index={index} />
        </div>
      )}
      <div className="center-row">
        {layer.left && (
          <div className="left-dock">
            <Dock type="left" data={layer.left} index={index} />
          </div>
        )}
        <div className="center-dock">
          {index - 1 < 0 ? <div className="dock main">Main content panel</div> : <Layer index={index - 1} />}
        </div>
        {layer.right && (
          <div className="right-dock">
            <Dock type="right" data={layer.right} index={index} />
          </div>
        )}
      </div>
      {layer.bottom && (
        <div className="bottom-dock">
          <Dock type="bottom" data={layer.bottom} index={index} />
        </div>
      )}
    </div>
  );
};
