import {
  Attributes,
  DEFAULT_LIST_FORMAT,
  DEFAULT_SELECTED_LIST_FORMAT,
  IMAGE_PLACEHOLDER,
  TEXT_PLACEHOLDER,
  menu$,
  selectMenuItem,
  useFormatVariable,
  useQspVariable,
} from '@qspider/game-state';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAtom } from '@xoid/react';
import { ReactNode, useContext, useState } from 'react';
import { useAttributes } from '../../content/attributes';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { menuContext } from '../../theme-core/menu';
import { ContentRenderer } from '../../content-renderer';

export const AeroQspMenu: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu');
  const isVisible = useAtom(menu$);
  const coordinates = useClickCoordinates();
  const isFixed = useQspVariable('FIXED_SIZE_MENU', '', 0, 0);
  const menuX = useQspVariable('MENU_X', '', 0, -1);
  const menuY = useQspVariable('MENU_Y', '', 0, -1);
  if (!isVisible) return null;
  const useMouseCordinates = menuX < 0 || menuY < 0;
  const left = useMouseCordinates ? coordinates.x : menuX;
  const top = useMouseCordinates ? coordinates.y : menuY;
  let className = attributes['className'] || '';
  if (isFixed) className += ' aero-fixed-menu';
  return (
    <DropdownMenu.Root open={true} onOpenChange={(): void => selectMenuItem(-1)}>
      <DropdownMenu.Trigger asChild>
        <div
          style={{
            position: 'fixed',
            left,
            top,
          }}
        ></div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={document.getElementById('portal-container')}>
        <DropdownMenu.Content align="start">
          <Tag style={style} {...attributes} className={className.trim()}>
            {children}
          </Tag>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const AeroQspMenuItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [isSelected, setIsSelected] = useState(false);
  const { item, index } = useContext(menuContext);
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-menu-item');

  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url("${item.image}")` : '',
  } as React.CSSProperties;

  const format = useFormatVariable(useFormat, DEFAULT_LIST_FORMAT)
    .replace(TEXT_PLACEHOLDER, item.name)
    .replace(IMAGE_PLACEHOLDER, item.image ? item.image : '');
  const selectedFormat = useFormatVariable(useSelectedFormat, DEFAULT_SELECTED_LIST_FORMAT)
    .replace(TEXT_PLACEHOLDER, item.name)
    .replace(IMAGE_PLACEHOLDER, item.image ? item.image : '');

  const onHover = (): void => {
    setIsSelected(true);
  };
  const onMouseLeave = (): void => {
    setIsSelected(false);
  };
  const onClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.preventDefault();
    selectMenuItem(index);
  };
  return (
    <DropdownMenu.Item asChild>
      <Tag {...attributes} style={preapredStyle} onClick={onClick} onMouseOver={onHover} onMouseLeave={onMouseLeave}>
        <ContentRenderer content={isSelected ? selectedFormat : format} />
      </Tag>
    </DropdownMenu.Item>
  );
};
