import React from 'react';
import { useResources } from '../../game/resource-manager';

export const Image: React.FC<{
  src: string;
  useMap: string;
  style: React.CSSProperties;
}> = ({ src, useMap, style }) => {
  const resources = useResources();

  return <img src={`${resources.get(src)}`} style={style} useMap={useMap} alt="" />;
};
