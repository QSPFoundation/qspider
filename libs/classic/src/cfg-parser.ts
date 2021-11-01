import { QspGUIPanel } from '../constants';

const GROUP_REGEXP = /\[(.*?)\]/i;
const LINE_REGEXP = /(.*?)=(.*)/i;

const IS_FLOATABLE_MASK = 1 << 0;

export enum WxWidgetsDirection {
  top = 1,
  right,
  bottom,
  left,
  center,
}
export type DirectionKey = keyof typeof WxWidgetsDirection;

export interface PanelData {
  besth: number;
  bestw: number;
  dir: DirectionKey;
  floating: boolean;
  layer: number;
  name: QspGUIPanel;
  pos: number;
  row: number;
}

export interface CfgData {
  Colors: { BackColor: number; FontColor: number; LinkColor: number };
  Font: { FontSize: number; FontName: string; UseFontSize: boolean };
  General: {
    Language: string;
    Panels: PanelData[];
    ShowHotkeys: boolean;
    Volume: number;
  };
  Pos: { Left: number; Top: number; Width: number; Height: number };
}

function extractLineData(line: string): [string, string] | [] {
  const match = line.match(LINE_REGEXP);
  if (match) {
    const [, key, value] = match;
    return [key, value];
  }
  return [];
}

function parseLayout(text: string): Record<string, unknown>[] {
  const pannels: Record<string, unknown>[] = [];
  text
    .split('|')
    .filter(Boolean)
    .forEach((line) => {
      if (line === 'layout2' || line.startsWith('dock_size')) {
        return;
      }
      const panelData: Record<string, unknown> = line
        .split(';')
        .map(extractLineData)
        .reduce((acc, [key, value]) => {
          if (key && value) {
            acc[key] = processData(key, value);
            if (key === 'state') {
              acc.floating = (Number(value) & IS_FLOATABLE_MASK) !== 0;
            }
          }
          return acc;
        }, {} as Record<string, unknown>);
      pannels.push(panelData);
    });
  return pannels;
}

const processors: Record<string, (x: string) => unknown> = {
  BackColor: Number,
  FontColor: Number,
  LinkColor: Number,
  FontSize: Number,
  UseFontSize: Boolean,
  Volume: Number,
  ShowHotkeys: Boolean,
  Panels: parseLayout,
  Left: Number,
  Top: Number,
  Width: Number,
  Height: Number,
  Maximize: Number,
  dir: (v: string) => WxWidgetsDirection[v as unknown as number],
  state: Number,
  row: Number,
  pos: Number,
  layer: Number,
  besth: Number,
  bestw: Number,
};

function processData(key: string, value: string): unknown {
  const processor = processors[key];
  return processor ? processor(value) : value;
}

export function parseCfg<T = unknown>(text: string): T {
  const result: Record<string, unknown> = {};

  let currentGroup: string | null = null;
  let currentGroupData: Record<string, unknown> = {};
  text
    .split(/\r?\n/gim)
    .filter(Boolean)
    .forEach((line) => {
      const [, groupName] = line.match(GROUP_REGEXP) || [];
      if (groupName) {
        if (currentGroup) {
          result[currentGroup] = currentGroupData;
        }
        currentGroup = groupName;
        currentGroupData = {};
      } else {
        const [key, value] = extractLineData(line);
        if (key && value) {
          currentGroupData[key] = processData(key, value);
        }
      }
    });
  if (currentGroup) {
    result[currentGroup] = currentGroupData;
  }
  return result as T;
}
