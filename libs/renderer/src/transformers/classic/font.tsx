import React from 'react';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';
import { fontSizeMap } from '../../content/font-sizes';

export const Font: React.FC<{
  size: string | null;
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ size, children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'span');
  const preparedStyle: React.CSSProperties = {
    ...style,
    fontSize: size != null ? fontSizeMap[size] || 'medium' : 'inherit',
  };
  return (
    <span {...attributes} style={preparedStyle}>
      {children}
    </span>
  );
};
