import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { Content } from '../../content/content';
import { useGameManager } from '../../../game/manager';
import { ActionImage } from './action-image';
import { WithTheme } from '../../../theme.types';

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

  &:hover {
    filter: brightness(70%);
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 5px 0px rgba(0, 0, 0, 0.75);
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
