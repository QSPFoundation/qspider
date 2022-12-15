import React from 'react';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';

export const fontSizeMap: Record<string, string> = {
  '-2': 'x-small',
  '-1': 'small',
  '+0': 'medium',
  '+1': 'large',
  '+2': 'x-large',
  '+3': 'xx-large',
  '+4': 'xxx-large',
  0: 'medium',
  1: 'x-small',
  2: 'small',
  3: 'medium',
  4: 'large',
  5: 'x-large',
  6: 'xx-large',
  7: 'xxx-large',
};

export const Font: React.FC<{
  size: string | null;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ size, children, attributes }) => {
  const { style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    fontSize: size != null ? fontSizeMap[size] || 'medium' : 'inherit',
  };
  return (
    <span {...preparedAttributes} style={preparedStyle}>
      {children}
    </span>
  );
};
