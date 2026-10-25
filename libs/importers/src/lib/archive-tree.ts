import { GAME_DESCRIPTOR_NAME } from '@qspider/contracts';
import type { FileDir } from './utils';

export function findRootDescriptorFolder(root: FileDir): [FileDir, Uint8Array] | null {
  for (const entry of root.content) {
    if (entry.type === 'file' && entry.name === GAME_DESCRIPTOR_NAME) {
      return [root, entry.data];
    }
  }
  for (const entry of root.content) {
    if (entry.type === 'dir') {
      const found = findRootDescriptorFolder(entry);
      if (found) return found;
    }
  }
  return null;
}

export function findRootGameFileFolder(root: FileDir): [FileDir, string] | null {
  let qspFile: string | null = null;
  let qspsFile: string | null = null;
  for (const entry of root.content) {
    if (entry.type === 'file') {
      if (entry.name.endsWith('.qsp') || entry.name.endsWith('.gam')) {
        qspFile = entry.name;
      }
      if (entry.name.endsWith('.qsps')) {
        qspsFile = entry.name;
      }
    }
  }
  if (qspFile) return [root, qspFile];
  if (qspsFile) return [root, qspsFile];
  for (const entry of root.content) {
    if (entry.type === 'dir') {
      const found = findRootGameFileFolder(entry);
      if (found) return found;
    }
  }
  return null;
}

export function getGameFolder(root: FileDir, filename: string): FileDir {
  const path = filename.split('/');
  path.pop();
  let dir: FileDir = root;
  for (const dirName of path) {
    const existing = dir.content.find((d): d is FileDir => d.type === 'dir' && d.name === dirName);
    if (!existing) throw new Error(`Failed to find game file ${filename} in archvive`);
    dir = existing;
  }
  return dir;
}
