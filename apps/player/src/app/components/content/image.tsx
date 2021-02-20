import React from 'react';
import { useResources } from '../../game/resource-manager';
import { useStyle } from '../../hooks/style';

export const Image: React.FC<{
  src: string;
  className?: string;
  useMap: string;
  style: React.CSSProperties;
}> = ({ src, useMap, style, className }) => {
  const resources = useResources();

  return <img src={`${resources.get(src).url}`} style={useStyle(style)} useMap={useMap} className={className} alt="" />;
};
