import { GameDescriptor, Resource } from '@qspider/contracts';
import { defer } from '@qspider/utils';
import { create } from 'xoid';
import { prepareCss } from './css';
import { cleanPath, convertQsps, isZip, readZip } from './utils';

export const localFS$ = create<Record<string, Uint8Array>>({});
export const isLocalFSUsed$ = create(false);
export const mainFileSource$ = create<Uint8Array | null>();
export const basePath$ = create('');
const localFsUrls = new Map<string, string>();

export async function fillLocalFS(source: ArrayBuffer, name: string): Promise<void> {
  const files: Record<string, Uint8Array> = {};
  if (isZip(source.slice(0, 4))) {
    let qspFilePath = '';
    let qspsFilePath = '';
    const resources = await readZip(source);
    for (const [path, file] of Object.entries(resources)) {
      const preparedPath = path.toLowerCase();
      files[preparedPath] = file;
      if (!qspFilePath && preparedPath.endsWith('.qsp') && !preparedPath.includes('/')) qspFilePath = preparedPath;
      if (!qspFilePath && !qspsFilePath && preparedPath.endsWith('.qsps') && !preparedPath.includes('/')) {
        qspsFilePath = preparedPath;
      }
    }
    if (qspFilePath) {
      mainFileSource$.set(files[qspFilePath]);
    } else if (qspsFilePath) {
      const source = convertQsps(files[qspsFilePath].buffer);
      mainFileSource$.set(new Uint8Array(source));
    } else {
      throw new Error('Game file not found');
    }
  } else {
    if (name.endsWith('qsps')) {
      const gameSource = convertQsps(source);
      mainFileSource$.set(new Uint8Array(gameSource));
    } else mainFileSource$.set(new Uint8Array(source));
  }
  localFS$.set(files);
  isLocalFSUsed$.set(true);
}

export function getResource(file: string): Resource {
  let path = preparePath(file);
  const type = path.toLowerCase().split('.').pop() as string;
  if (isLocalFSUsed$.value) {
    path = path.toLowerCase();
    let url = localFsUrls.get(path);
    if (url) {
      return { url, type };
    }
    const content = localFS$.value[path];
    if (content) {
      const blob = new Blob([content]);
      url = URL.createObjectURL(blob);
      localFsUrls.set(path, url);
      return { url, type };
    }
    return { url: '', type };
  }

  return { url: path, type };
}

export async function getBinaryContent(file: string): Promise<ArrayBuffer> {
  const path = preparePath(file);
  if (isLocalFSUsed$.value) {
    const content = localFS$.value[path.toLowerCase()];
    if (!content) new Error(`File ${file} not found`);
    return content;
  }

  return fetch(path).then((r) => {
    if (!r.ok) throw new Error(`File ${file} not found`);
    return r.arrayBuffer();
  });
}

export async function getTextContent(file: string): Promise<string> {
  const path = preparePath(file);
  if (isLocalFSUsed$.value && !file.startsWith('http')) {
    const content = localFS$.value[path.toLowerCase()];
    if (!content) throw new Error(`File ${file} not found`);
    const blob = new Blob([content]);
    return blob.text();
  }
  return fetch(path).then((r) => {
    if (!r.ok) throw new Error(`File ${file} not found`);
    return r.text();
  });
}

function preparePath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${basePath$.value}${cleanPath(path)}`;
}

export async function loadAdditionalResources(resources: GameDescriptor['resources']): Promise<void> {
  if (!resources) return;
  const { styles, scripts, fonts } = resources;
  const promisses = [];
  if (styles) {
    promisses.push(loadAdditionalStyles(styles));
  }
  if (scripts) {
    promisses.push(loadAdditionalScripts(scripts));
  }
  if (fonts) {
    loadAdditionalFonts(fonts);
  }
  await Promise.allSettled([...promisses, document.fonts.ready]);
}

async function loadAdditionalStyles(styles: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const style of styles) {
    const { url } = getResource(style);
    const response = await fetch(url);
    if (!response.ok) continue;
    const text = await response.text();
    const processed = await prepareCss(text, style);
    const gameStyle = document.createElement('style');
    gameStyle.innerText = processed;
    gameStyle.dataset['qspiderResource'] = 'style';
    document.head.appendChild(gameStyle);
  }
  await Promise.allSettled(promises);
}

async function loadAdditionalScripts(scripts: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const script of scripts) {
    const gameScript = document.createElement('script');
    gameScript.type = 'text/javascript';
    gameScript.src = getResource(script).url;
    gameScript.dataset['qspiderResource'] = 'script';
    const defered = defer<void>();
    gameScript.onload = (): void => defered.resolve();
    gameScript.onerror = (): void => defered.reject(new Error(`File not found: ${script}`));
    promises.push(defered.promise);
    document.head.appendChild(gameScript);
  }
  await Promise.allSettled(promises);
}

function loadAdditionalFonts(fonts: [string, string, string, string][]): void {
  const css = [];
  for (const [name, path, weight, style] of fonts) {
    css.push(`
    @font-face {
      font-family: "${name}";
      src: url("${getResource(path).url}");
      font-display: block;
      font-style: ${style || 'normal'};
      font-weight: ${weight || 'normal'};
    }
  `);
  }
  const gameStyle = document.createElement('style');
  gameStyle.innerText = css.join('\n');
  gameStyle.dataset['qspiderResource'] = 'style';
  document.head.appendChild(gameStyle);
}

export function clearAdditionalResources(): void {
  document.querySelectorAll('[data-qspider-resource]').forEach((el) => el.remove());
}

export function clearResources(): void {
  localFS$.set({});
  isLocalFSUsed$.set(false);
  mainFileSource$.set(null);
  basePath$.set('');
  for (const value of localFsUrls.values()) {
    URL.revokeObjectURL(value);
  }
  localFsUrls.clear();
}
