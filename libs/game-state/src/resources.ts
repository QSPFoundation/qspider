import { Resource } from '@qspider/contracts';
import { create } from 'xoid';
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
  if (isLocalFSUsed$.value) {
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
  return `${basePath$.value}${cleanPath(path)}`;
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
