import React from 'react';
import { useGameManager } from '../../game/manager';

export const Image: React.FC<{
  src: string;
  style: React.CSSProperties;
}> = ({ src, style }) => {
  const manager = useGameManager();

  return <img src={`${manager.resourcePrefix}${src}`} style={style} alt="" />;
};
