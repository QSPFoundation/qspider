export interface GameDescriptor {
  id: string;
  mode: 'classic' | 'aero' | 'qspider';
  title: string;
  author?: string;
  ported_by?: string;
  version?: string;
  description?: string;
  save_slots?: number;
  file: string;
  hotkeys?: Record<string, string>;
  resources?: {
    styles?: string[];
    scripts?: string[];
    fonts?: [string, string, string, string][];
    icon?: string;
  };
  window?: {
    width: number;
    height: number;
    resizable?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    fullscreen?: boolean;
  };
  aero?: {
    width: number;
    height: number;
  };
  themes?: string[];
  defaultTheme?: string;
}

export interface PlayerConfig {
  game: GameDescriptor[];
}
