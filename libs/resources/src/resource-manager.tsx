import { Unzipped } from 'fflate';
import { GameDescriptor, IResourceManager, Resource } from '@qspider/contracts';
import { defer, resolvePath } from '@qspider/utils';
import { cleanPath, isExternalSource, isZip, readZip } from './helpers';

export const GAME_PATH = 'game';

// TODO move config related code

export class ResourceManager implements IResourceManager {
  private _basePath = `${GAME_PATH}/`;

  // private _gameConfig: CfgData | undefined | false = undefined;
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
      source = await fetch(path).then((r) => r.arrayBuffer());
    }
    if (isZip(source.slice(0, 4))) {
      source = await this.processZip(source);
    }

    return source;
  }

  openGameArchive(source: ArrayBuffer): Promise<ArrayBuffer> {
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
    return gameSource;
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

  async getBinaryContent(file: string): Promise<ArrayBuffer> {
    const path = this.preparePath(file);
    if (this._zipResources[path.toLowerCase()]) {
      return this._zipResources[path.toLowerCase()];
    }

    return fetch(path).then((r) => r.arrayBuffer());
  }

  async getTextContent(file: string): Promise<string> {
    const path = this.preparePath(file);
    if (this._zipResources[path.toLowerCase()]) {
      const blob = new Blob([this._zipResources[path.toLowerCase()]]);
      return blob.text();
    }

    return fetch(path).then((r) => r.text());
  }

  async loadAdditionalResources(resources: GameDescriptor['resources']): Promise<void> {
    if (!resources) return;
    if (resources.styles) {
      await this.loadAdditionalStyles(resources.styles);
    }
    if (resources.scripts) {
      await this.loadAdditionalScripts(resources.scripts);
    }
    if (resources.fonts) {
      for (const font of resources.fonts) {
        this.loadAdditionalFont(font);
      }
    }
    if (resources.icon) {
      this.updateIcon(this.get(resources.icon).url);
    }
  }

  async loadAdditionalStyles(styles: string[]): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const style of styles) {
      const isExternal = style.startsWith('http');
      if (isExternal) {
        const gameStyle = document.createElement('link');
        gameStyle.rel = 'stylesheet';
        gameStyle.href = style;
        gameStyle.dataset.qspiderResource = 'style';
        const defered = defer<void>();
        gameStyle.onload = (): void => defered.resolve();
        gameStyle.onerror = (): void => defered.reject(new Error(`File not found: ${style}`));
        promises.push(defered.promise);
        document.head.appendChild(gameStyle);
      } else {
        const { url } = this.get(style);
        const response = await fetch(url);
        const text = await response.text();
        const processed = text.replace(/url\(['"]?(.*?)['"]?\)/gim, (match, path) => {
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return `url("${path}")`;
          }
          const { url } = this.get(resolvePath(style, path));
          return `url("${url}")`;
        });
        const gameStyle = document.createElement('style');
        gameStyle.innerText = processed;
        gameStyle.dataset.qspiderResource = 'style';
        document.head.appendChild(gameStyle);
      }
    }
    await Promise.allSettled(promises);
  }

  async loadAdditionalScripts(scripts: string[]): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const script of scripts) {
      const gameScript = document.createElement('script');
      gameScript.type = 'text/javascript';
      gameScript.src = this.get(script).url;
      gameScript.dataset.qspiderResource = 'script';
      const defered = defer<void>();
      gameScript.onload = (): void => defered.resolve();
      gameScript.onerror = (): void => defered.reject(new Error(`File not found: ${script}`));
      promises.push(defered.promise);
      document.head.appendChild(gameScript);
    }
    await Promise.allSettled(promises);
  }

  loadAdditionalFont(font: [string, string, string, string]): void {
    const [name, path, weight, style] = font;
    const css = `
      @font-face {
        font-family: "${name}";
        src: url("${this.get(path).url}");
        font-display: block;
        font-style: ${style || 'normal'};
        font-weight: ${weight || 'normal'};
      }
    `;
    const gameStyle = document.createElement('style');
    gameStyle.innerText = css;
    gameStyle.dataset.qspiderResource = 'style';
    document.head.appendChild(gameStyle);
  }

  updateIcon(favicon = 'favicon.ico'): void {
    (document.getElementById('favicon') as HTMLLinkElement).href = favicon;
  }

  clearAdditionalResources(): void {
    document.querySelectorAll('[data-qspider-resource]').forEach((el) => el.remove());
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
    for (const value of this._zipUrls.values()) {
      URL.revokeObjectURL(value);
    }
  }
}
