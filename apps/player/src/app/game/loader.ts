export const GAME_PATH = '/game';
const GAME_DESCRIPTOR_PATH = `${GAME_PATH}/game.json`;

export interface GameDescriptor {
  title: string;
  file: string;
  folder: string;
}

export const fetchGameDescriptor = async (): Promise<GameDescriptor> => {
  return fetch(GAME_DESCRIPTOR_PATH).then((r) => r.json());
};

export const fetchGameSource = async (
  fileName: string,
  folder = '/'
): Promise<ArrayBuffer> => {
  return fetch(`${GAME_PATH}${folder}${fileName}`).then((r) => r.arrayBuffer());
};
