import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from '../../content/attributes';

export const Strike: React.FC<{
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ children, attributes }) => {
  const { style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    textDecoration: 'line-through',
  };
  return (
    <span {...preparedAttributes} style={preparedStyle}>
      {children}
    </span>
  );
};

export const Big: React.FC<{
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ children, attributes }) => {
  const { style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    fontSize: 'larger',
  };
  return (
    <span {...preparedAttributes} style={preparedStyle}>
      {children}
    </span>
  );
};

export const Tt: React.FC<{
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ children, attributes }) => {
  const { style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    fontFamily: 'monospace',
  };
  return (
    <span {...preparedAttributes} style={preparedStyle}>
      {children}
    </span>
  );
};
