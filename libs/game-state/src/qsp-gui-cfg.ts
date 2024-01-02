import { QspGUIPanel } from '@qspider/contracts';
import { create } from 'xoid';
import { defaultClassicTheme$ } from './themes';

export enum WxWidgetsDirection {
  top = 1,
  right,
  bottom,
  left,
  center,
}
export type DockPlace = 'top' | 'right' | 'bottom' | 'left' | 'center';

export interface PanelData {
  dir: DockPlace;
  floating: boolean;
  layer: number;
  name: QspGUIPanel;
  pos: number;
  row: number;
  prop: number;
}

export interface CfgData {
  BackColor: number;
  FontColor: number;
  LinkColor: number;
  FontSize: number;
  FontName: string;
  Panels: PanelData[];
  Docks: Record<string, number>;
}

interface LayoutLayer {
  index: number;
  top: PanelData[];
  right: PanelData[];
  bottom: PanelData[];
  left: PanelData[];
  center: PanelData[] | LayoutLayer;
}
interface LayoutTree {
  layer: LayoutLayer | null;
  floating: PanelData[];
}

export const qspGuiCfg$ = create<CfgData | null>(null);
export const qspGuiLayout$ = create<string | null>((get) => {
  const config = get(qspGuiCfg$);
  if (!config) return null;
  const defaultTheme = get(defaultClassicTheme$).qsp_player?.template ?? '';
  const layout = buildLayoutTree(config.Panels);
  let template = '';
  if (layout.layer) template += convertLayer(layout.layer, config.Docks, defaultTheme);
  for (const floating of layout.floating) {
    template += convertPane(floating, defaultTheme, true);
  }
  return template;
});

function buildLayoutTree(panels: PanelData[]): LayoutTree {
  const maxLayer = getMaxLayer(panels);

  const floating: PanelData[] = panels.filter((panel) => panel.floating && panel.name === 'imgview');
  const docked: PanelData[] = panels.filter((panel) => !panel.floating);

  let currentLayer: LayoutLayer | null = null;
  for (let i = 0; i <= maxLayer; i++) {
    const layerPanels = getLayerPanels(i, docked);
    currentLayer = {
      index: i,
      top: [],
      right: [],
      bottom: [],
      left: [],
      center: currentLayer || [],
    };
    for (const panel of layerPanels) {
      if (panel.dir === 'center' && panel.name !== 'desc') continue;
      (currentLayer[panel.dir] as PanelData[]).push(panel);
    }
  }

  return {
    layer: currentLayer,
    floating,
  };
}

function convertLayer(layer: LayoutLayer, docks: Record<string, number>, defaultTheme: string): string {
  return `<qsp-cl-layer>${convertDock('top', layer.top, docks, defaultTheme)}${convertDock(
    'left',
    layer.left,
    docks,
    defaultTheme,
  )}${
    Array.isArray(layer.center)
      ? convertDock('center', layer.center, docks, defaultTheme)
      : convertLayer(layer.center, docks, defaultTheme)
  }${convertDock('right', layer.right, docks, defaultTheme)}${convertDock(
    'bottom',
    layer.bottom,
    docks,
    defaultTheme,
  )}</qsp-cl-layer>`;
}

function convertDock(place: string, panels: PanelData[], docks: Record<string, number>, defaultTheme: string): string {
  if (!panels.length) return '';
  const visibilityPanes = panels.map((panel) => (panel.name !== 'desc' ? panel.name : '')).filter(Boolean);
  const visibility = visibilityPanes.length > 0 ? ` visibility="${visibilityPanes.join('|')}"` : '';
  const [panel] = panels;
  const dockKey = `${WxWidgetsDirection[panel.dir]},${panel.layer},${panel.row}`;
  const size = place !== 'center' && docks[dockKey] ? ` size="${docks[dockKey]}"` : '';
  return `<qsp-cl-dock place="${place}"${visibility}${size}>${panels
    .map((panel) => convertPane(panel, defaultTheme, false))
    .join('')}</qsp-cl-dock>`;
}

function convertPane(pane: PanelData, defaultTheme: string, isFloating: boolean): string {
  return `<qsp-cl-pane visibility="${pane.name !== 'desc' ? pane.name : ''}" proportion="${
    pane.prop
  }">${extractFromDefaultTheme(pane.name, defaultTheme, isFloating)}</qsp-cl-pane>`;
}

function getMaxLayer(panels: PanelData[]): number {
  return Math.max(...panels.map(({ layer }) => layer));
}

function getLayerPanels(layer: number, panels: PanelData[]): PanelData[] {
  return panels.filter((panel) => panel.layer === layer).sort((a, b) => a.pos - b.pos);
}

const paneToTagMap: Record<string, string> = {
  imgview: 'qsp-view',
  acts: 'qsp-actions',
  desc: 'qsp-main',
  objs: 'qsp-objects',
  vars: 'qsp-stats',
  input: 'qsp-cmd',
};
function extractFromDefaultTheme(name: string, defaultTheme: string, isFloating: boolean): string {
  const tagName = paneToTagMap[name];
  if (!tagName) return '';
  const regexp = new RegExp(`<${tagName}([\\s\\S]*?)</${tagName}>`, 'im');
  const match = defaultTheme.match(regexp);
  const template = match?.[0] ?? '';
  return isFloating
    ? template.replace(new RegExp(`<${tagName}(.*?)>`, 'im'), `<${tagName} modal>`)
    : template.replace(new RegExp(`<${tagName}(.*?)>`, 'im'), `<${tagName}>`);
}

const GROUP_REGEXP = /\[(.*?)\]/i;
const LINE_REGEXP = /(.*?)=(.*)/i;
const DOCK_LINE = /dock_size\((.*?)\)=(.*)/;
const IS_FLOATABLE_MASK = 1 << 0;

const asNumber = (key: string, value: string): Record<string, unknown> => ({ [key]: Number(value) });
const asString = (key: string, value: string): Record<string, unknown> => ({ [key]: value });

const converters: Record<string, (key: string, value: string) => Record<string, unknown>> = {
  BackColor: asNumber,
  FontColor: asNumber,
  LinkColor: asNumber,
  FontSize: asNumber,
  FontName: asString,
  Panels: parsePanels,

  dir: (key: string, value: string) => ({ [key]: WxWidgetsDirection[value as unknown as number] }),
  layer: asNumber,
  name: asString,
  pos: asNumber,
  row: asNumber,
  prop: asNumber,
};

function processData(key: string, value: string): Record<string, unknown> {
  const converter = converters[key];
  return converter?.(key, value) ?? {};
}

function parsePanels(key: string, text: string): Record<string, unknown> {
  const panels: Record<string, unknown>[] = [];
  const docks: Record<string, number> = {};
  for (const line of text.split('|').filter(Boolean)) {
    if (line === 'layout2') continue;
    if (line.startsWith('dock_size')) {
      const match = line.match(DOCK_LINE);
      if (match) {
        const [, index, size] = match;
        if (index && size) {
          docks[index] = Number(size);
        }
      }
    } else {
      const panelData: Record<string, unknown> = line
        .split(';')
        .map(extractLineData)
        .reduce(
          (acc, [key, value]) => {
            if (key === 'state') {
              acc['floating'] = (Number(value) & IS_FLOATABLE_MASK) !== 0;
            } else if (key && value && key in converters) {
              return { ...acc, ...processData(key, value) };
            }
            return acc;
          },
          {} as Record<string, unknown>,
        );
      panels.push(panelData);
    }
  }
  return { Panels: panels, Docks: docks };
}

function extractLineData(line: string): [string, string] | [] {
  const match = line.match(LINE_REGEXP);
  if (match) {
    const [, key, value] = match;
    return [key, value];
  }
  return [];
}

export function parseCfg(text: string): CfgData {
  let result: Record<string, unknown> = {};

  for (const line of text.split(/\r?\n/gim).filter(Boolean)) {
    if (GROUP_REGEXP.test(line)) continue;
    const [key, value] = extractLineData(line);
    if (key && value && key in converters) {
      result = { ...result, ...processData(key, value) };
    }
  }
  return result as unknown as CfgData;
}
