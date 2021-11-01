import { QspListItem } from '@qspider/qsp-wasm';

export function prepareContent(text: string): string {
  // this solves a problem in 1812 where link contain &gt without space and this is parsed wrong
  // also in cluedo there is \" inside href parsed wrong
  // todo find a way to handle this in parser

  return text.replace(/&gt /g, '& gt ').replace(/\\"/g, '&quot;');
}
export function cleanPath(path: string): string {
  return path.replace(/\\/g, '/');
}
export function prepareList(list: QspListItem[]): QspListItem[] {
  return list.map((item) => ({
    name: prepareContent(item.name),
    image: cleanPath(item.image),
  }));
}
