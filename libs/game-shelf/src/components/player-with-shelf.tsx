import { useAtom } from '@xoid/react';
import { GameRunner } from '@qspider/renderer';

import { currentMode$ } from '../game-shelf';
import { QspiderPlayer } from './qspider-player';

import './main.css';

export const PlayerWithShelf: React.FC = () => {
  const mode = useAtom(currentMode$);
  if (mode === 'game') return <GameRunner />;
  return <QspiderPlayer />;
};
