import React from 'react';
import styled from '@emotion/styled';
import { useStyle } from '../hooks';
import { Attributes, useAttributes } from '../hooks/attributes';

const StyledTable = styled.table<{
  border: number;
  cellspacing: number;
  cellpadding: number;
}>`
  border-color: rgb(238, 238, 237);
  border-style: inset;
  border-width: ${(props): number => props.border}px;
  border-spacing: ${(props): number => props.cellspacing || 0}px;

  td,
  th {
    padding: ${(props): number => props.cellpadding || 0}px;
    border-color: rgb(238, 238, 237);
    border-style: inset;
    border-width: ${(props): number => props.border}px;

    img {
      vertical-align: bottom;
    }
  }
`;

export const Table: React.FC<{
  border: number;
  cellspacing: number;
  cellpadding: number;
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
}> = ({ border, cellspacing, cellpadding, style, className, children, attributes }) => {
  return (
    <StyledTable
      {...useAttributes(attributes)}
      style={useStyle(style)}
      className={className}
      border={border}
      cellspacing={cellspacing}
      cellpadding={cellpadding}
    >
      {children}
    </StyledTable>
  );
};
