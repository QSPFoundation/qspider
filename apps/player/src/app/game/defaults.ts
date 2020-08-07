import { LayoutDock } from './cfg-converter';
import { QspGUIPanel } from '../constants';

export const DEFAULT_LAYOUT: LayoutDock[] = [
  ['bottom', 3.3, [[QspGUIPanel.Input, 100]]],
  [
    'center',
    -1,
    [
      ['right', 20, [[QspGUIPanel.Objects, 61.36]]],
      [
        'bottom',
        28.6,
        [
          [QspGUIPanel.Actions, 58.27],
          [QspGUIPanel.Stats, 41],
        ],
      ],
      ['center', -1, [[QspGUIPanel.Main, -1]]],
    ],
  ],
];
export const DEFAULT_FLOATING: [string, number, number][] = [[QspGUIPanel.ImageView, 832, 150]];
