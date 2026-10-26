import React from 'react';
import { useAttributes } from '../../content/attributes';
import { tableClassName, tableStyle } from './legacy-styles';
import { Attributes } from '@qspider/game-state';

export const Table: React.FC<{
  border: number;
  cellspacing: number;
  cellpadding: number;
  align?: React.CSSProperties['textAlign'];
  valign?: React.CSSProperties['verticalAlign'];
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ border, cellspacing, cellpadding, align, valign, attrs, children }) => {
  const [, style, { className, ...attributes }] = useAttributes(attrs, 'table');
  const preparedStyle: React.CSSProperties = {
    ...style,
    ...tableStyle({ border, cellspacing, cellpadding, align, valign }),
  };
  const preparedClassName = tableClassName(className);
  return (
    <table {...attributes} style={preparedStyle} className={preparedClassName}>
      {children}
    </table>
  );
};
