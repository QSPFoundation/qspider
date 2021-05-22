import React from 'react';
import { useResources } from '../../game/resource-manager';

export const Source: React.FC<{
  src: string;
  media?: string;
  type?: string;
}> = ({ src, media, type }) => {
  const resources = useResources();

  return <source src={`${resources.get(src).url}`} media={media} type={type} />;
};
