import type { SevenZipModule, FileSystem } from '7z-wasm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SevenZipWasmUrl from '7z-wasm/7zz.wasm?url';

export type ArchiveContent = Record<string, Uint8Array>;

export const isSupportedArchive = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return isZip(data) || isRar(data) || is7zip(data);
};

export const isZip = (data: Uint8Array): boolean => {
  return (
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)
  );
};

export const isRar = (data: Uint8Array): boolean => {
  return data[0] === 0x52 && data[1] === 0x61 && data[2] === 0x72 && data[3] === 0x21;
};

export const is7zip = (data: Uint8Array): boolean => {
  return data[0] === 55 && data[1] === 122 && data[2] === 188 && data[3] === 175 && data[4] === 39 && data[5] === 28;
};

let sevenZip: SevenZipModule | null = null;
async function initSevenZip(): Promise<SevenZipModule> {
  if (sevenZip) return sevenZip;
  const SevenZip = (await import('7z-wasm')).default;
  sevenZip = await SevenZip({
    wasmBinary: await fetch(SevenZipWasmUrl).then((r) => r.arrayBuffer()),
  });
  // HACK: The WASM 7-Zip sets file mode to 000 when extracting tar archives, making it impossible to extract sub-folders
  const chmodOrig = sevenZip.FS.chmod;
  sevenZip.FS.chmod = function (path, mode, dontFollow): void {
    if (!mode) {
      return;
    }
    chmodOrig(path, mode, dontFollow);
  };
  return sevenZip;
}

const read7zip = async (buffer: ArrayBuffer): Promise<FileDir> => {
  const sevenZip = await initSevenZip();
  const archiveName = 'archive.tmp';
  const archiveData = new Uint8Array(buffer);
  const stream = sevenZip.FS.open(archiveName, 'w+');
  sevenZip.FS.write(stream, archiveData, 0, archiveData.length);
  sevenZip.FS.close(stream);

  sevenZip.FS.mkdir('game');

  sevenZip.callMain(['x', archiveName, `-ogame`, '-y', '-r']);
  sevenZip.FS.chdir('game');

  const content = readExtractedDirectory(sevenZip.FS, '.');

  removeDirRecursive(sevenZip.FS, 'game');
  sevenZip.FS.rmdir('game');
  sevenZip.FS.unlink(archiveName);
  return content;
};

export const readSupportedArchive = (buffer: ArrayBuffer): Promise<FileDir> => {
  return read7zip(buffer);
};

const folderToSkip = new Set(['.', '..', '__MACOSX']);
const filesToSkip = new Set(['.DS_Store']);

function readExtractedDirectory(FS: FileSystem, path: string): FileDir {
  const dir: FileDir = {
    type: 'dir',
    name: path,
    content: [],
  };
  FS.chdir(path);
  for (const name of FS.readdir('.')) {
    if (folderToSkip.has(name)) continue;
    if (filesToSkip.has(name)) continue;

    const { mode } = FS.lookupPath(name).node;
    if (FS.isFile(mode)) {
      dir.content.push({
        type: 'file',
        name,
        data: FS.readFile(name),
      });
    } else if (FS.isDir(mode)) {
      dir.content.push(readExtractedDirectory(FS, name));
    }
  }
  FS.chdir('..');
  return dir;
}

function removeDirRecursive(FS: FileSystem, path: string): void {
  FS.chdir(path);
  for (const name of FS.readdir('.')) {
    if (name === '.' || name === '..') continue;
    const { mode } = FS.lookupPath(name).node;
    if (FS.isFile(mode)) {
      FS.unlink(name);
    } else if (FS.isDir(mode)) {
      removeDirRecursive(FS, name);
      FS.rmdir(name);
    }
  }
  FS.chdir('..');
}

export type FileDir = {
  type: 'dir';
  name: string;
  content: Array<FileDir | File>;
};

export type File = {
  type: 'file';
  name: string;
  data: Uint8Array;
};
