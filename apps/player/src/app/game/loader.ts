import TOMLparse from '@iarna/toml/parse-string';
import { parseCfg, CfgData } from './cfg-parser';

export const GAME_PATH = '/assets/game';
const GAME_DESCRIPTOR_PATH = `${GAME_PATH}/game.cfg`;
const GAME_FONFIG_FILE = 'qspgui.cfg';

export interface GameDescriptor {
  title: string;
  file: string;
  folder: string;
}

export const fetchGameDescriptor = async (): Promise<GameDescriptor> => {
  return fetch(GAME_DESCRIPTOR_PATH)
    .then((r) => r.text())
    .then((text) => (TOMLparse(text) as unknown) as GameDescriptor);
};

export const fetchGameCongig = async (folder = '/'): Promise<CfgData> => {
  return fetch(`${GAME_PATH}${folder}${GAME_FONFIG_FILE}`)
    .then((r) => r.text())
    .then((text) => parseCfg<CfgData>(text));
};

export const fetchGameSource = async (fileName: string, folder = '/'): Promise<ArrayBuffer> => {
  return fetch(`${GAME_PATH}${folder}${fileName}`).then((r) => r.arrayBuffer());
};

export const saveGameToFile = async (path: string, data: ArrayBuffer): Promise<void> => {
  const preparedData = await binaryToDataUri(data);
  localStorage.setItem(path, preparedData);
};

export const readGameFromFile = async (path: string): Promise<ArrayBuffer> => {
  const data = localStorage.getItem(path);
  if (data) {
    return dataURItoBinary(data);
  }
  return null;
};

export const dataURItoBinary = async (dataUri: string): Promise<ArrayBuffer> => {
  const [, dataPart] = dataUri.split(',');
  const bstr = atob(dataPart);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr.buffer;
};

export const binaryToDataUri = (buffer: ArrayBuffer): Promise<string> => {
  return new Promise((resolve) => {
    const blob = new Blob([buffer]);
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result as string);
    };
    reader.readAsDataURL(blob);
  });
};
