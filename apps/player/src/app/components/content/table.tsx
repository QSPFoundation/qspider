import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const Table = styled.table<
  {
    border: number;
    cellspacing: number;
    cellpadding: number;
  } & WithTheme
>`
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
    text-align: left;
  }
`;
