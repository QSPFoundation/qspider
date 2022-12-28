export interface GameDescriptor {
  id: string;
  mode: 'classic' | 'aero' | 'qspider';
  title: string;
  description?: string;
  file: string;
  local_path?: string;
  local_id?: string;
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
