import { GameDescriptor, PlayerConfig, Resource } from '@qspider/contracts';
import { defer, fetchProxyFallback } from '@qspider/utils';
import { create } from 'xoid';
import { prepareCss } from './css';
import {
  ArchiveContent,
  cleanPath,
  convertQsps,
  extractFileTree,
  FileDir,
  File,
  isSupportedArchive,
  readSupportedArchive,
  isExternalPath,
  isHashPath,
} from './utils';
import { parse } from 'iarna-toml-esm';
import mime from 'mime/lite';

export const localFS$ = create<Record<string, Uint8Array>>({});
export const isLocalFSUsed$ = create(false);
export const baseUrl$ = create('');
const localFsUrls = new Map<string, string>();

export async function fillLocalFS(source: ArrayBuffer, name: string): Promise<void> {
  localFS$.set({});
  if (isSupportedArchive(source.slice(0, 4))) {
    const resources = await readSupportedArchive(source);
    const [files, mainFilePath] = normalizeFSTree(resources);
    localFS$.set(files);
    if (mainFilePath.endsWith('.qsp')) {
      mainFileSource$.set(files[mainFilePath]);
    } else if (mainFilePath.endsWith('.qsps')) {
      const source = convertQsps(files[mainFilePath].buffer);
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

  isLocalFSUsed$.set(true);
}

export function getResource(file: string): Resource {
  if (isExternalPath(file) || isHashPath(file)) {
    return {
      url: file.replace(/^qspider:/, ''),
      type: file.toLowerCase().split('.').pop() as string,
    };
  }
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
      const blob = new Blob([content], { type: mime.getType(type) || undefined });
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
    if (!content) new Error(`File not found`);
    return content;
  }

  return fetchProxyFallback(path).then((r) => {
    if (!r.ok) throw new Error(`File not found`);
    return r.arrayBuffer();
  });
}

export async function getTextContent(file: string): Promise<string> {
  const path = preparePath(file);
  if (isLocalFSUsed$.value && !file.startsWith('http')) {
    const content = localFS$.value[path.toLowerCase()];
    if (!content) throw new Error(`File not found`);
    const blob = new Blob([content]);
    return blob.text();
  }
  return fetchProxyFallback(path).then((r) => {
    if (!r.ok) throw new Error(`File not found`);
    return r.text();
  });
}

function preparePath(path: string): string {
  return `${baseUrl$.value}${cleanPath(path)}`;
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
    const response = await fetchProxyFallback(url);
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
  baseUrl$.set('');
  for (const value of localFsUrls.values()) {
    URL.revokeObjectURL(value);
  }
  localFsUrls.clear();
}

function normalizeFSTree(content: ArchiveContent): [ArchiveContent, string] {
  let root = extractFileTree(content);
  if (root.content.length === 1 && root.content[0].type === 'dir') {
    root = root.content[0];
  }

  let qspFilePath = '';
  let qspsFilePath = '';
  for (const entry of root.content) {
    if (entry.type === 'dir') continue;
    const name = entry.name.toLocaleLowerCase();
    if (!qspFilePath && name.endsWith('.qsp') && !name.includes('/')) qspFilePath = name;
    if (!qspsFilePath && name.endsWith('.qsps') && !name.includes('/')) qspsFilePath = name;
  }
  if (!qspFilePath && !qspsFilePath) throw new Error('Game file not found');

  const normalized: ArchiveContent = {};
  for (const entry of root.content) {
    processFSEntry(entry, normalized, '');
  }
  return [normalized, qspFilePath || qspsFilePath];
}

function processFSEntry(entry: FileDir | File, repo: ArchiveContent, prefix: string): void {
  if (entry.type === 'dir') {
    prefix += entry.name.toLocaleLowerCase() + '/';
    for (const child of entry.content) {
      processFSEntry(child, repo, prefix);
    }
  } else {
    repo[prefix + entry.name.toLocaleLowerCase()] = entry.data;
  }
}

export async function extractGameDescriptor(source: ArrayBuffer): Promise<GameDescriptor | null> {
  if (isSupportedArchive(source.slice(0, 4))) {
    const resources = await readSupportedArchive(source);
    const [files] = normalizeFSTree(resources);
    if ('game.cfg' in files) {
      const blob = new Blob([files['game.cfg']]);
      const text = await blob.text();
      const descriptor = parse(text) as unknown as PlayerConfig;
      return descriptor.game[0];
    }
  }
  return null;
}
