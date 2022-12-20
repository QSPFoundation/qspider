import React from 'react';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';

export const Table: React.FC<{
  border: number;
  cellspacing: number;
  cellpadding: number;
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ border, cellspacing, cellpadding, attrs, children }) => {
  const [, style, { className, ...attributes }] = useAttributes(attrs, 'table');
  const preparedStyle: React.CSSProperties = {
    ...style,
    ...{
      '--table-border-width': `${border || 0}px`,
      '--table-cellspacing': `${cellspacing || 0}px`,
      '--table-cellpadding': `${cellpadding || 0}px`,
    },
  };
  const preparedClassName = className ? `${className} classic-table` : 'classic-table';
  return (
    <table {...attributes} style={preparedStyle} className={preparedClassName}>
      {children}
    </table>
  );
};
