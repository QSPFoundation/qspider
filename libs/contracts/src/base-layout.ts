import { Theme } from '@emotion/react';
import { QspGUIPanel } from './constants';

export interface BaseLayoutDefaults {
  defaultBackgroundColor: string;
  defaultColor: string;
  defaultLinkColor: string;
  defaultFontSize: number;
  defaultFontName: string;
}

export interface IBaseLayout {
  readonly theme: Theme;
  isPanelVisible(name: QspGUIPanel): boolean;
  fillDefaults(defaults: BaseLayoutDefaults): void;
}
