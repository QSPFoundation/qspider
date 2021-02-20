import { observer } from 'mobx-react-lite';
import React from 'react';
import { useGameManager } from '../game/manager';
import { AeroPlayer } from './aero/aero-player';
import { Player } from './player';

export const PlayerMode: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.currentGame) return null;
  if (manager.currentGame.mode === 'aero') return <AeroPlayer />;
  return <Player />;
});
