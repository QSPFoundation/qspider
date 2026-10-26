import React from 'react';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';
import { fontSizeStyle } from './legacy-styles';

export const Font: React.FC<{
  size: string | null;
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ size, children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'span');
  const preparedStyle: React.CSSProperties = {
    ...style,
    fontSize: fontSizeStyle(size),
  };
  return (
    <span {...attributes} style={preparedStyle}>
      {children}
    </span>
  );
};
