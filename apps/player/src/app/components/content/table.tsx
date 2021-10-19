import React from 'react';
import styled from '@emotion/styled';
import { useStyle } from '../../hooks/style';

const StyledTable = styled.table<{
  border: number;
  cellspacing: number;
  cellpadding: number;
}>`
  border-color: rgb(238, 238, 237);
  border-style: inset;
  border-width: ${(props) => props.border}px;
  border-spacing: ${(props) => props.cellspacing || 0}px;

  td,
  th {
    padding: ${(props) => props.cellpadding || 0}px;
    border-color: rgb(238, 238, 237);
    border-style: inset;
    border-width: ${(props) => props.border}px;
    text-align: var(--text-align, left);
  }
`;

export const Table: React.FC<{
  border: number;
  cellspacing: number;
  cellpadding: number;
  className?: string;
  style: React.CSSProperties;
}> = ({ border, cellspacing, cellpadding, style, className, children }) => {
  return (
    <StyledTable
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

export const Tr: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <tr style={useStyle(style)} className={className}>
      {children}
    </tr>
  );
};
export const Th: React.FC<{ className?: string; style: React.CSSProperties; colspan: number; rowspan: number }> = ({
  style,
  className,
  colspan,
  rowspan,
  children,
}) => {
  return (
    <th colSpan={colspan} rowSpan={rowspan} style={useStyle(style)} className={className}>
      {children}
    </th>
  );
};
export const Td: React.FC<{ className?: string; style: React.CSSProperties; colspan: number; rowspan: number }> = ({
  style,
  className,
  colspan,
  rowspan,
  children,
}) => {
  return (
    <td colSpan={colspan} rowSpan={rowspan} style={useStyle(style)} className={className}>
      {children}
    </td>
  );
};
