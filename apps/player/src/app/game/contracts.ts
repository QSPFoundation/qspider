export interface GameDescriptor {
  id: string;
  mode: 'classic' | 'aero';
  title: string;
  description?: string;
  file: string;
  hotkeys?: Record<string, string>;
  aero?: {
    width: number;
    height: number;
  };
}

export interface PlayerConfig {
  game: GameDescriptor[];
}
