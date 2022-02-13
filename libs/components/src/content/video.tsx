import React from 'react';
import { Attributes, useAttributes } from '../hooks/attributes';

export const Video: React.FC<{
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
}> = ({ style, className, children, attributes }) => {
  return (
    <video {...useAttributes(attributes)} className={className} style={style} preload="auto" loop autoPlay>
      {children}
    </video>
  );
};
