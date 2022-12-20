import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from '../../content/attributes';

export const Strike: React.FC<{
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'span');
  const preparedStyle: React.CSSProperties = {
    ...style,
    textDecoration: 'line-through',
  };
  return (
    <span {...attributes} style={preparedStyle}>
      {children}
    </span>
  );
};

export const Big: React.FC<{
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'span');
  const preparedStyle: React.CSSProperties = {
    ...style,
    fontSize: 'larger',
  };
  return (
    <span {...attributes} style={preparedStyle}>
      {children}
    </span>
  );
};

export const Tt: React.FC<{
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ children, attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'span');
  const preparedStyle: React.CSSProperties = {
    ...style,
    fontFamily: 'monospace',
  };
  return (
    <span {...attributes} style={preparedStyle}>
      {children}
    </span>
  );
};
