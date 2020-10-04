import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { Content } from '../../content/content';
import { useGameManager } from '../../../game/manager';
import { ActionImage } from './action-image';
import { WithTheme } from '../../../theme.types';
import Color from 'color';

export const ActionButton = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fontSize}pt;
  padding: 4px 8px;
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: 0;
  cursor: pointer;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  user-select: none;

  &:hover {
    background-color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
    color: ${(props) => props.theme.backgroundColor};
  }

  &:focus {
    outline: none;
  }
`;

export const ActionItem: React.FC<{
  action: QspListItem;
  index: number;
  onSelect: (index: number) => void;
}> = ({ action, index, onSelect }) => {
  const gameManager = useGameManager();
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      (e.target as HTMLButtonElement).blur();
      onSelect(index);
    },
    [index, onSelect]
  );
  return (
    <ActionButton role="menuitem" tabIndex={0} onClick={onClick}>
      {action.image && <ActionImage src={`${gameManager.resourcePrefix}${action.image}`} alt={action.name} />}
      <Content content={action.name} />
    </ActionButton>
  );
};
