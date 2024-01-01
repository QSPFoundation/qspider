import { GameDescriptor } from './game';

export type GameShelfEntry = {
  id: string;
  mode: 'classic' | 'aero' | 'qspider';
  icon?: string;
  title: string;
  author?: string;
  ported_by?: string;
  version?: string;
  description?: string;
  meta?: {
    source: string;
    source_id: string;
    source_date: number;
  };
  loadConfig: {
    url: string;
    entrypoint: string;
    local_path?: string;
    local_id?: string;
    descriptor?: GameDescriptor;
  };
};
