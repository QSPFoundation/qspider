import { readQsps, writeQsp } from '@qsp/converters';
import { QspListItem } from '@qsp/wasm-engine';
import { unzip, Unzipped } from 'fflate';

export const isZip = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return (
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)
  );
};

export const readZip = (buffer: ArrayBuffer): Promise<Unzipped> => {
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

  return text.replace(/&gt /g, '& gt ').replace(/\\"/g, '&quot;');
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
