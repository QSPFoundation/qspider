import React from 'react';
import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import { MouseEvent } from 'react';
import { Icon } from './icons';

export const Button = styled.button<WithTheme>`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid transparent;

  padding: 0;
  margin: 0;
  width: 26px;
  height: 26px;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;

  &:hover {
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
