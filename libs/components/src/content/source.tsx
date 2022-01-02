import { useResources } from '@qspider/providers';
import React from 'react';

export const Source: React.FC<{
  src?: string;
  media?: string;
  type?: string;
}> = ({ src, media, type }) => {
  const resources = useResources();
  if (!src) return null;
  return <source src={`${resources.get(src).url}`} media={media} type={type} />;
};
