import { readQsps, writeQsp } from '@qsp/converters';
import { QspListItem } from '@qsp/wasm-engine';
import { cleanPath } from '@qspider/utils';

export function convertQsps(source: ArrayBuffer): ArrayBuffer {
  const data = new Uint8Array(source.slice(0, 2));
  const encoding = data[0] === 255 && data[1] === 254 ? 'utf-16le' : 'utf-8';
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(source);
  return writeQsp(readQsps(text));
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
