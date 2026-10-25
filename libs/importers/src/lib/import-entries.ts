import type { GameDescriptor, GameShelfEntry } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';

type LoadConfig = GameShelfEntry['loadConfig'];

export function splitGameUrl(url: string): { cleanUrl: string; base: string; fileName: string } {
  const urlObject = new URL(url);
  urlObject.hash = '';
  urlObject.search = '';
  const cleanUrl = urlObject.toString();
  const base = cleanUrl.slice(0, cleanUrl.lastIndexOf('/') + 1);
  const fileName = cleanUrl.replace(base, '');
  return { cleanUrl, base, fileName };
}

export function descriptorEntry(descriptor: GameDescriptor, loadConfig: LoadConfig): GameShelfEntry {
  let icon = descriptor.resources?.icon;
  if (icon) {
    icon = `${loadConfig.url}${icon}`;
  }
  return {
    id: descriptor.id,
    mode: descriptor.mode,
    title: descriptor.title,
    author: descriptor.author,
    ported_by: descriptor.ported_by,
    version: descriptor.version,
    description: descriptor.description,
    icon,
    loadConfig: {
      ...loadConfig,
      descriptor,
    },
  };
}

export function archiveGameId(archiveName: string, rootDescriptor?: GameDescriptor): string {
  return rootDescriptor?.id || cyrb53(archiveName);
}

export function archiveFallbackEntry(
  archiveName: string,
  loadConfig: LoadConfig,
  rootDescriptor?: GameDescriptor,
): GameShelfEntry {
  let icon = rootDescriptor?.resources?.icon;
  if (icon) {
    icon = `${loadConfig.url}${icon}`;
  }
  return {
    id: archiveGameId(archiveName, rootDescriptor),
    title: rootDescriptor?.title || decodeURI(archiveName.slice(archiveName.lastIndexOf('/') + 1)),
    mode: rootDescriptor?.mode || (archiveName.endsWith('aqsp') ? 'aero' : 'classic'),
    author: rootDescriptor?.author,
    ported_by: rootDescriptor?.ported_by,
    version: rootDescriptor?.version,
    description: rootDescriptor?.description,
    icon,
    loadConfig,
  };
}

export function urlConfigEntry(found: GameDescriptor, base: string): GameShelfEntry {
  return {
    id: found.id,
    mode: found.mode,
    title: found.title,
    author: found.author,
    ported_by: found.ported_by,
    version: found.version,
    description: found.description,
    loadConfig: {
      url: base,
      entrypoint: found.file,
    },
  };
}

export function urlFallbackEntry(
  cleanUrl: string,
  base: string,
  fileName: string,
  rootDescriptor?: GameDescriptor,
): GameShelfEntry {
  return {
    id: rootDescriptor?.id || cyrb53(cleanUrl),
    title: rootDescriptor?.title || fileName,
    mode: rootDescriptor?.mode || 'classic',
    author: rootDescriptor?.author,
    ported_by: rootDescriptor?.ported_by,
    version: rootDescriptor?.version,
    description: rootDescriptor?.description,
    loadConfig: {
      url: base,
      entrypoint: fileName,
      descriptor: rootDescriptor,
    },
  };
}

export function fileEntry(fileName: string, loadConfig: LoadConfig): GameShelfEntry {
  return {
    id: cyrb53(fileName),
    title: fileName,
    mode: 'classic',
    loadConfig,
  };
}
