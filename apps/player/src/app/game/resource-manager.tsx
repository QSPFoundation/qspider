import { unzip, Unzipped } from 'fflate';
import React, { useRef } from 'react';
import { CfgData, parseCfg } from './cfg-parser';
import { cleanPath } from './helpers';
import { fetchGameConfig, fetchGameSource, GAME_PATH, GAME_FONFIG_FILE } from './loader';

export interface Resource {
  url: string;
  type: string;
}

const isExternalSource = (path: string): boolean => path.startsWith('http://') || path.startsWith('https://');
const isZip = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return (
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)
  );
};

const readZip = (buffer: ArrayBuffer): Promise<Unzipped> => {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

export class ResourceManager {
  private _basePath = `${GAME_PATH}/`;

  private _gameConfig: CfgData | undefined | false = undefined;
  private _zipResources: Unzipped = {};
  private _zipUrls: Map<string, string> = new Map();

  get basePath(): string {
    return this._basePath;
  }

  async loadGame(file: string, isNewGame: boolean): Promise<ArrayBuffer> {
    const path = isExternalSource(file) ? file : this.preparePath(file);
    if (isNewGame) {
      this.updateBasePath(path);
    }

    let source;
    if (this._zipResources[path.toLowerCase()]) {
      source = this._zipResources[path.toLowerCase()];
    } else {
      source = await fetchGameSource(path);
    }
    if (isZip(source.slice(0, 4))) {
      source = await this.processZip(source);
    }

    return source;
  }

  openGame(source: ArrayBuffer): Promise<ArrayBuffer> {
    if (isZip(source.slice(0, 4))) {
      this.clear();
      return this.processZip(source);
    }
    throw new Error('Only zip files are supported');
  }

  async processZip(source: ArrayBuffer): Promise<ArrayBuffer> {
    const resources = await readZip(source);
    for (const [path, file] of Object.entries(resources)) {
      this._zipResources[path.toLowerCase()] = file;
    }
    const gameSource = this.findGameFile(resources);
    if (!gameSource) throw new Error('game file not found in archive, make sure it is on top level');
    this._basePath = '';
    if (this._zipResources[GAME_FONFIG_FILE]) {
      this._gameConfig = parseCfg(new TextDecoder().decode(new Uint8Array(this._zipResources[GAME_FONFIG_FILE])));
    } else {
      this._gameConfig = false;
    }
    return gameSource;
  }

  async getConfig(): Promise<CfgData | false> {
    if (this._gameConfig !== undefined) {
      return this._gameConfig;
    }
    try {
      const text = await fetchGameConfig(this.basePath);
      this._gameConfig = parseCfg(text);
    } catch (_) {
      this._gameConfig = false;
    }
    return this._gameConfig as CfgData | false;
  }

  async getAeroConfig(): Promise<{ width: number; height: number; title: string } | null> {
    if (this._zipResources['config.xml']) {
      const blob = new Blob([this._zipResources['config.xml']]);
      const content = await blob.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const gameElement = doc.querySelector('game')!;
      return {
        width: parseInt(gameElement.getAttribute('width') || '800'),
        height: parseInt(gameElement.getAttribute('height') || '600'),
        title: gameElement.getAttribute('title') || '',
      };
    }
    return null;
  }

  get(file: string): Resource {
    let path = this.preparePath(file);
    const type = path.toLowerCase().split('.').pop() as string;
    if (this._zipResources[path.toLowerCase()]) {
      path = path.toLowerCase();
      let url = this._zipUrls.get(path);
      if (url) {
        return { url, type };
      }
      const blob = new Blob([this._zipResources[path]]);
      url = URL.createObjectURL(blob);
      this._zipUrls.set(path, url);
      return { url, type };
    }
    return { url: path, type };
  }

  private findGameFile(zipResources: Unzipped): Uint8Array | null {
    if (!zipResources) {
      return null;
    }
    for (const key of Object.keys(zipResources)) {
      if (key.endsWith('.qsp') && !key.includes('/')) {
        return zipResources[key];
      }
    }
    return null;
  }

  private updateBasePath(path: string): void {
    this._basePath = path.slice(0, path.lastIndexOf('/') + 1);
  }

  private preparePath(path: string): string {
    return `${this._basePath}${cleanPath(path)}`;
  }

  clear(): void {
    this._basePath = `${GAME_PATH}/`;
    this._zipResources = {};
    this._gameConfig = undefined;
    for (const value of this._zipUrls.values()) {
      URL.revokeObjectURL(value);
    }
  }
}

const managerContext = React.createContext<ResourceManager | null>(null);

export const ResourceProvider: React.FC = ({ children }) => {
  const ref = useRef(new ResourceManager());
  return <managerContext.Provider value={ref.current}>{children}</managerContext.Provider>;
};

export const useResources = (): ResourceManager => {
  const resources = React.useContext(managerContext);
  if (!resources) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useResources must be used within a StoreProvider.');
  }
  return resources;
};
