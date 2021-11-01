export interface GameDescriptor {
  id: string;
  mode: 'classic' | 'aero';
  title: string;
  description?: string;
  file: string;
  hotkeys?: Record<string, string>;
  resources?: {
    styles?: string[];
    scripts?: string[];
    fonts?: [string, string, string, string][];
    icon?: string;
  };
  aero?: {
    width: number;
    height: number;
  };
}

export interface PlayerConfig {
  game: GameDescriptor[];
}
