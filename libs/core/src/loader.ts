import TOMLparse from '@iarna/toml/parse-string';
import { PlayerConfig } from './contracts';

export const GAME_PATH = 'game';
const GAME_DESCRIPTOR_PATH = `${GAME_PATH}/game.cfg`;
export const GAME_FONFIG_FILE = 'qspgui.cfg';

export const fetchPlayerConfig = async (): Promise<PlayerConfig> => {
  return fetch(GAME_DESCRIPTOR_PATH)
    .then((r) => r.text())
    .then((text) => TOMLparse(text) as unknown as PlayerConfig);
};
