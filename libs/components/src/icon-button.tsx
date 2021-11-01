import React from 'react';
import styled from '@emotion/styled';
import { MouseEvent } from 'react';
import { Icon, IconType } from '@qspider/icons';

const Button = styled.button`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  border-radius: 4px;

  background-color: var(--inverted-background-color);
  color: var(--background-color) !important;
  border: 1px solid var(--inverted-background-color);

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
    background-color: var(--background-color);
    color: var(--inverted-background-color) !important;
    border: 1px solid var(--inverted-background-color);
  }
  &:focus {
    outline: none;
  }
`;

export const IconButton: React.FC<{ icon: IconType; onClick: (e: MouseEvent) => void }> = ({ onClick, icon }) => {
  return (
    <Button onClick={onClick}>
      <Icon icon={icon} />
    </Button>
  );
};
