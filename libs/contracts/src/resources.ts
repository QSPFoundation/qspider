export interface Resource {
  url: string;
  type: string;
}

export interface IResourceManager {
  loadGame(file: string, isNewGame: boolean): Promise<ArrayBuffer>;
  openGameArchive(source: ArrayBuffer): Promise<ArrayBuffer>;

  get(file: string): Resource;
  clear(): void;
}
