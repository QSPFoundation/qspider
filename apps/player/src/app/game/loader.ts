import TOMLparse from '@iarna/toml/parse-string';
import { parseCfg, CfgData } from './cfg-parser';

export const GAME_PATH = 'game';
const GAME_DESCRIPTOR_PATH = `${GAME_PATH}/game.cfg`;
const GAME_FONFIG_FILE = 'qspgui.cfg';

export interface GameDescriptor {
  id: string;
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
  return fetch(`${folder}${fileName}`).then((r) => r.arrayBuffer());
};
