import React from 'react';
import { useGameManager } from '../../game/manager';
import { preparePath } from '../../game/helpers';

export const Image: React.FC<{
  src: string;
  style: React.CSSProperties;
}> = ({ src, style }) => {
  const manager = useGameManager();

  return (
    <img
      src={`${manager.resourcePrefix}${preparePath(src)}`}
      style={style}
      alt=""
    />
  );
};
