import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from '../../content/attributes';

export const Video: React.FC<{
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ children, attributes }) => {
  const preparedAttributes = useAttributes(attributes, 'video');
  return (
    <video {...preparedAttributes} preload="auto" loop autoPlay>
      {children}
    </video>
  );
};
