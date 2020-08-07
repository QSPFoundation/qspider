import { CfgData, PanelData, DirectionKey } from './cfg-parser';
import { QspGUIPanel } from '../constants';

function getMaxLayer(panels: PanelData[]): number {
  return Math.max(...panels.map(({ layer }) => layer));
}

function getLayerPanels(layer: number, panels: PanelData[]): PanelData[] {
  return panels.filter((panel) => panel.layer === layer);
}

export function isCenter(key: DirectionKey): boolean {
  return key === 'center';
}

export function isHorizontal(key: DirectionKey): boolean {
  return key === 'top' || key === 'bottom';
}

function getSize(dock: DirectionKey, panel: PanelData): number {
  const prop = isHorizontal(dock) ? 'besth' : 'bestw';
  return panel[prop];
}

function getOppositeSize(dock: DirectionKey, panel: PanelData): number {
  const prop = isHorizontal(dock) ? 'bestw' : 'besth';
  return panel[prop];
}

type NestedLayers = {
  top: PanelData[];
  right: PanelData[];
  bottom: PanelData[];
  left: PanelData[];
  center: PanelData[] | NestedLayers;
};

export type LayoutPanel = [QspGUIPanel, number];
export type LayoutDock = [DirectionKey, number, LayoutPanel[] | LayoutDock[]];

function convertLayout(data: NestedLayers, dimensions: { width: number; height: number }): LayoutDock[] {
  const layout: LayoutDock[] = [];
  let center;

  for (const dock of Object.keys(data)) {
    const dockPannels = data[dock];
    if (Array.isArray(dockPannels) && !dockPannels.length) {
      continue;
    }
    if (dock === 'center') {
      if (!Array.isArray(dockPannels)) {
        center = dockPannels;
      } else {
        layout.push(['center', -1, [[QspGUIPanel.Main, -1]]]);
      }
    } else {
      let size = 0;
      const pannels = dockPannels
        .sort((a, b) => a.pos - b.pos)
        .map((pannel): [string, number] => {
          size = Math.max(size, getSize(dock as DirectionKey, pannel));
          return [pannel.name, getOppositeSize(dock as DirectionKey, pannel)];
        });
      const mainSizeKey = isHorizontal(dock as DirectionKey) ? 'height' : 'width';
      const wrappingSizeKey = isHorizontal(dock as DirectionKey) ? 'width' : 'height';
      const proportion = (size / dimensions[mainSizeKey]) * 100;
      console.log('!!!', dock, size, mainSizeKey, dimensions[mainSizeKey], dockPannels);
      layout.push([
        dock as DirectionKey,
        proportion,
        pannels.map(([name, s]) => [name, (s / dimensions[wrappingSizeKey]) * 100]),
      ]);
    }
  }

  if (center) {
    layout.push(['center', -1, convertLayout(center, dimensions)]);
  }

  return layout;
}

export function extractLayoutData(config: CfgData): { layout: LayoutDock[]; floating: [string, number, number][] } {
  const maxLayer = getMaxLayer(config.General.Panels);

  const floating: PanelData[] = config.General.Panels.filter((pannel) => pannel.floating);
  const docked: PanelData[] = config.General.Panels.filter((pannel) => !pannel.floating);

  let currentLayer: NestedLayers;
  for (let i = 0; i <= maxLayer; i++) {
    const layerPanels = getLayerPanels(i, docked);
    currentLayer = {
      top: [],
      right: [],
      bottom: [],
      left: [],
      center: currentLayer || [],
    };
    for (const panel of layerPanels) {
      (currentLayer[panel.dir] as PanelData[]).push(panel);
    }
  }

  return {
    layout: convertLayout(currentLayer, {
      width: config.Pos.Width,
      height: config.Pos.Height,
    }),
    floating: floating.map((panel) => [panel.name, panel.bestw, panel.besth]),
  };
}
