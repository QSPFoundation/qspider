import { GameDescriptor } from './game';

export interface Resource {
  url: string;
  type: string;
}

export interface IResourceManager {
  updateBasePath(path: string): void;

  prepareGameFromPath(file: string, isNewGame: boolean): Promise<ArrayBuffer>;
  prepareGameFromSource(source: string | ArrayBuffer, isNewGame: boolean): Promise<ArrayBuffer>;

  get(file: string): Resource;
  getBinaryContent(file: string): Promise<ArrayBuffer>;
  getTextContent(file: string): Promise<string>;

  loadAdditionalResources(resources: GameDescriptor['resources']): Promise<void>;
  clearAdditionalResources(): void;

  clear(): void;
}
