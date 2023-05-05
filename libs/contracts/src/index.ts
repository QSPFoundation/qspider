export * from './constants';
export * from './game';
export * from './window-manager';
export * from './storage';

export interface Resource {
  url: string;
  type: string;
}

export interface ThemeTranslation {
  lang: string;
  tkey: string;
  value: string;
}
