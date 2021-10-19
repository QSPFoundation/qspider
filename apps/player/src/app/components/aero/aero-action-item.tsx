import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { IMAGE_PLACEHOLDER, QspListItem, TEXT_PLACEHOLDER } from '@qspider/qsp-wasm';
import { Content } from '../content/content';
import { useAeroLayout } from '../../game/aero/aero-layout';

export const ActionButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  cursor: pointer;
  background-color: transparent;
  user-select: none;
  border-radius: 0;
  border: 0;
  padding: 0;

  &:focus {
    outline: none;
  }
  & table td {
    padding: 0;
    vertical-align: middle;
  }
  & table img {
    display: inherit;
  }
`;

export const AeroActionItem: React.FC<{
  action: QspListItem;
  type: 'actionsUI' | 'objectsUI' | 'menuUI';
  index: number;
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = ({ action, index, type, onSelect, onAction }) => {
  const [content, setContent] = useState({ usual: '', selected: '' });
  const [isHovered, setIsHovered] = useState(false);
  const layout = useAeroLayout();

  const { format, selectedFormat } = layout[type];
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
  useEffect(() => {
    setContent({
      usual: format.replace(TEXT_PLACEHOLDER, action.name).replace(IMAGE_PLACEHOLDER, action.image ? action.image : ''),
      selected: selectedFormat
        .replace(TEXT_PLACEHOLDER, action.name)
        .replace(IMAGE_PLACEHOLDER, action.image ? action.image : ''),
    });
  }, [action, format, selectedFormat]);

  return (
    <ActionButton
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Content content={isHovered ? content.selected : content.usual} />
    </ActionButton>
  );
};
