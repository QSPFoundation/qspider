import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { Content } from '../../content/content';
import { useGameManager } from '../../../game/manager';
import { ActionImage } from './action-image';
import { WithTheme } from '../../../theme.types';

export const ActionButton = styled.button<WithTheme>`
  display: block;
  font-size: ${(props) => props.theme.fontSize}px;
  padding: 4px 8px;
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: 0;
  cursor: pointer;
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
      onSelect(index);
    },
    [index, onSelect]
  );
  return (
    <ActionButton role="menuitem" tabIndex={0} onClick={onClick}>
      {action.image && (
        <ActionImage
          src={`${gameManager.resourcePrefix}${action.image}`}
          alt={action.name}
        />
      )}
      <Content content={action.name} />
    </ActionButton>
  );
};
