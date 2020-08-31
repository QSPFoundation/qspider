import React from 'react';
import { useGameManager } from '../../game/manager';
import { preparePath } from '../../game/helpers';

export const Image: React.FC<{
  src: string;
  useMap: string;
  style: React.CSSProperties;
}> = ({ src, useMap, style }) => {
  const manager = useGameManager();

  return <img src={`${manager.resourcePrefix}${preparePath(src)}`} style={style} useMap={useMap} alt="" />;
};
