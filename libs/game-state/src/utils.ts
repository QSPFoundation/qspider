import { readQsps, writeQsp } from '@qsp/converters';
import { QspListItem } from '@qsp/wasm-engine';
import { strToU8, unzip } from 'fflate';
import { createExtractorFromData } from 'node-unrar-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import unrarWasm from 'node-unrar-js/esm/js/unrar.wasm?url';

export type ArchiveContent = Record<string, Uint8Array>;

export const isSupportedArchive = (buffer: ArrayBuffer): boolean => {
  return isZip(buffer) || isRar(buffer);
};

export const isZip = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return (
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)
  );
};

export const isRar = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return data[0] === 0x52 && data[1] === 0x61 && data[2] === 0x72 && data[3] === 0x21;
};

export const readSupportedArchive = (buffer: ArrayBuffer): Promise<ArchiveContent> => {
  if (isZip(buffer)) return readZip(buffer);
  if (isRar(buffer)) return readRar(buffer);
  throw new Error('Unsupported archive format');
};

export const readZip = (buffer: ArrayBuffer): Promise<ArchiveContent> => {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      // workaround for https://github.com/101arrowz/fflate/issues/112
      for (const name of Object.keys(data)) {
        const buf = strToU8(name, true);
        const cpEncoded = new TextDecoder('cp866').decode(buf);
        if (name !== cpEncoded) {
          data[cpEncoded] = data[name];
          delete data[name];
        }
      }
      resolve(data);
    });
  });
};

let wasmBinary: ArrayBuffer | undefined = undefined;
const getWasmBinary = async (): Promise<ArrayBuffer | undefined> => {
  if (wasmBinary) return wasmBinary;
  wasmBinary = await fetch(unrarWasm).then((r) => r.arrayBuffer());
  return wasmBinary;
};

export const readRar = async (buffer: ArrayBuffer): Promise<ArchiveContent> => {
  const wasmBinary = await getWasmBinary();
  const extractor = await createExtractorFromData({ data: buffer, wasmBinary });
  const extracted = extractor.extract();
  const content: ArchiveContent = {};
  for (const file of extracted.files) {
    if (file.fileHeader.flags.directory) continue;
    const data = file.extraction;
    if (data) {
      content[file.fileHeader.name] = data;
    }
  }
  return content;
};

export type FileDir = {
  type: 'dir';
  name: string;
  content: Array<FileDir | File>;
};

export type File = {
  type: 'file';
  name: string;
  filename: string;
  data: Uint8Array;
};

export function extractFileTree(content: ArchiveContent): FileDir {
  const root: FileDir = {
    type: 'dir',
    name: '.',
    content: [],
  };
  for (const [filename, data] of Object.entries(content)) {
    const path = filename.split('/');
    const file = path.pop();
    let dir: FileDir = root;
    for (const dirName of path) {
      const existing = dir.content.find((d): d is FileDir => d.type === 'dir' && d.name === dirName);
      if (existing) {
        dir = existing;
      } else {
        const newDir: FileDir = {
          type: 'dir',
          name: dirName,
          content: [],
        };
        dir.content.push(newDir);
        dir = newDir;
      }
    }
    if (file) {
      dir.content.push({
        type: 'file',
        name: file,
        filename,
        data,
      });
    }
  }

  return root;
}

export function convertQsps(source: ArrayBuffer): ArrayBuffer {
  const data = new Uint8Array(source.slice(0, 2));
  const encoding = data[0] === 255 && data[1] === 254 ? 'utf-16le' : 'utf-8';
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(source);
  return writeQsp(readQsps(text));
}

export function cleanPath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function prepareContent(text: string): string {
  // this solves a problem in 1812 where link contain &gt without space and this is parsed wrong
  // also in cluedo there is \" inside href parsed wrong
  // todo find a way to handle this in parser
  return text
    .replace(/&gt([^;])/gi, (_, symbol) => {
      return '& gt ' + symbol;
    })
    .replace(/\\"/g, '&quot;');
}

export function prepareList(list: QspListItem[]): QspListItem[] {
  return list.map((item) => ({
    name: prepareContent(item.name),
    image: cleanPath(item.image),
  }));
}

export const clamp = function (value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
};

export function isExternalPath(path: string): boolean {
  return /^[a-z]+:/i.test(path);
}
export function isHashPath(path: string): boolean {
  return path.startsWith('#');
}
