import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { Content } from '../../content/content';
import { ActionImage } from './action-image';
import { useResources } from '../../../game/resource-manager';

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: 0;
  cursor: pointer;
  background-color: var(--background-color, transparent);
  user-select: none;

  &:hover {
    background-color: var(--inverted-background-color);
    color: var(--inverted-color);
  }

  &:focus {
    outline: none;
  }
`;

export const ActionItem: React.FC<{
  action: QspListItem;
  index: number;
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = ({ action, index, onSelect, onAction }) => {
  const resources = useResources();
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      (e.target as HTMLButtonElement).blur();
      onAction(index);
    },
    [index, onAction]
  );
  const onHover = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onSelect(index);
    },
    [index, onSelect]
  );
  return (
    <ActionButton role="menuitem" tabIndex={0} onMouseOver={onHover} onClick={onClick} data-qsp="action">
      {action.image && (
        <ActionImage src={`${resources.get(action.image).url}`} alt={action.name} data-qsp="action-image" />
      )}
      <Content content={action.name} />
    </ActionButton>
  );
};
