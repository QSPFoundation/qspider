import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { IMAGE_PLACEHOLDER, QspListItem, TEXT_PLACEHOLDER } from '@qspider/qsp-wasm';
import { WithTheme } from '../../theme.types';
import { useResources } from '../../game/resource-manager';
import { Content } from '../content/content';
import { useAeroLayout } from '../../game/aero/aero-layout';

export const ActionButton = styled.button<WithTheme>`
  font-size: ${(props) => props.theme.fontSize}pt;
  width: 100%;
  text-align: left;
  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.textColor};
  user-select: none;
  border-radius: 0;
  border: 0;
  padding: 0;

  &:focus {
    outline: none;
  }
`;

export const AeroActionItem: React.FC<{
  action: QspListItem;
  type: 'actionsUI' | 'objectsUI' | 'menuUI';
  index: number;
  onSelect: (index: number) => void;
}> = ({ action, index, type, onSelect }) => {
  const [content, setContent] = useState({ usual: '', selected: '' });
  const [isHovered, setIsHovered] = useState(false);
  const resources = useResources();
  const layout = useAeroLayout();
  console.log(type, layout, layout[type]);
  const { format, selectedFormat } = layout[type];
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      (e.target as HTMLButtonElement).blur();
      onSelect(index);
    },
    [index, onSelect]
  );
  useEffect(() => {
    setContent({
      usual: format
        .replace(TEXT_PLACEHOLDER, action.name)
        .replace(IMAGE_PLACEHOLDER, action.image ? resources.get(action.image).url : ''),
      selected: selectedFormat
        .replace(TEXT_PLACEHOLDER, action.name)
        .replace(IMAGE_PLACEHOLDER, action.image ? resources.get(action.image).url : ''),
    });
  }, [action, format, selectedFormat, resources]);
  console.log(content);
  return (
    <ActionButton
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Content content={isHovered ? content.selected : content.usual} />
    </ActionButton>
  );
};
