import React from 'react';
import { useStyle } from '../hooks';
import { Attributes, useAttributes } from '../hooks/attributes';

export interface ElementProps {
  attributes: Attributes;
  className?: string;
  children?: React.ReactNode;
  selfClose?: boolean;
  tagName: string;
  style: React.CSSProperties;
}

export const Element: React.FC<ElementProps> = ({
  attributes = {},
  className,
  children = null,
  selfClose = false,
  tagName,
  style,
}) => {
  const Tag = tagName as 'span';
  const preparedStyle = useStyle(style);
  const preparedAttributes = useAttributes(attributes);
  return selfClose ? (
    <Tag className={className} {...preparedAttributes} style={preparedStyle} />
  ) : (
    <Tag className={className} {...preparedAttributes} style={preparedStyle}>
      {children}
    </Tag>
  );
};
