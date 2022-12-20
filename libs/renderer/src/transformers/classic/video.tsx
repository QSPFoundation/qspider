import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from '../../content/attributes';

export const Video: React.FC<{
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'video');
  return (
    <video style={style} {...attributes} preload="auto" loop autoPlay>
      {children}
    </video>
  );
};
