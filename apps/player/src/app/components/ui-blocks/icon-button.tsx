import React from 'react';
import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import { MouseEvent } from 'react';
import { Icon } from './icons';
import Color from 'color';

export const Button = styled.button<WithTheme>`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  border-radius: 4px;

  background-color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
  color: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => Color(props.theme.borderColor).negate().hex()};

  padding: 0;
  margin: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;

  &:hover {
    background-color: ${(props) => props.theme.backgroundColor};
    color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
    border-color: ${(props) => props.theme.borderColor};
  }
  &:focus {
    outline: none;
  }
`;

export const IconButton: React.FC<{ icon: string; onClick: (e: MouseEvent) => void }> = ({ onClick, icon }) => {
  return (
    <Button onClick={onClick}>
      <Icon icon={icon} />
    </Button>
  );
};
