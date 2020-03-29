const GAME_PATH = '/game';
const GAME_DESCRIPTOR_PATH = `${GAME_PATH}/game.json`;

export interface GameDescriptor {
  title: string;
  file: string;
}

export const fetchGameDescriptor = async (): Promise<GameDescriptor> => {
  return fetch(GAME_DESCRIPTOR_PATH).then((r) => r.json());
};

export const fetchGameSource = async (
  fileName: string
): Promise<ArrayBuffer> => {
  return fetch(`${GAME_PATH}/${fileName}`).then((r) => r.arrayBuffer());
};
