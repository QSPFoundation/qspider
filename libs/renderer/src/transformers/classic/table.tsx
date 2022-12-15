import React from 'react';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';

export const Table: React.FC<{
  border: number;
  cellspacing: number;
  cellpadding: number;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ border, cellspacing, cellpadding, attributes, children }) => {
  const { className, style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    ...{
      '--table-border-width': `${border || 0}px`,
      '--table-cellspacing': `${cellspacing || 0}px`,
      '--table-cellpadding': `${cellpadding || 0}px`,
    },
  };
  const preparedClassName = className ? `${className} classic-table` : 'classic-table';
  return (
    <table {...preparedAttributes} style={preparedStyle} className={preparedClassName}>
      {children}
    </table>
  );
};
