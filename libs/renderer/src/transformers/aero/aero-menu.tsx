import {
  Attributes,
  DEFAULT_LIST_FORMAT,
  DEFAULT_SELECTED_LIST_FORMAT,
  IMAGE_PLACEHOLDER,
  TEXT_PLACEHOLDER,
  menu$,
  useFormatVariable,
  useQspVariable,
} from '@qspider/game-state';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAtom } from '@xoid/react';
import { ReactNode, useContext, useState } from 'react';
import { animated } from '@react-spring/web';
import { useAttributes } from '../../content/attributes';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { menuContext } from '../../theme-core/menu';
import { ContentRenderer } from '../../content-renderer';
import { useAeroEffect } from './use-aero-effect';

export const AeroQspMenu: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu');
  const menu = useAtom(menu$);
  const coordinates = useClickCoordinates();
  const isFixed = useQspVariable('FIXED_SIZE_MENU', '', 0, 0);
  const menuX = useQspVariable('MENU_X', '', 0, -1);
  const menuY = useQspVariable('MENU_Y', '', 0, -1);
  const transitions = useAeroEffect(menu.isOpen, '$MENU_EFFECT', 'MENU_EFFECT_TIME');
  const useMouseCoordinates = menuX < 0 || menuY < 0;
  const left = useMouseCoordinates ? coordinates.x : menuX;
  const top = useMouseCoordinates ? coordinates.y : menuY;
  let className = attributes['className'] || '';
  if (isFixed) className += ' aero-fixed-menu';
  return (
    <DropdownMenu.Root open={menu.isOpen} onOpenChange={(): void => menu$.actions.close()}>
      <DropdownMenu.Trigger asChild>
        <div
          style={{
            position: 'fixed',
            left,
            top,
          }}
        ></div>
      </DropdownMenu.Trigger>
      {transitions((styles, open) =>
        open ? (
          <DropdownMenu.Portal forceMount container={document.getElementById('portal-container')}>
            <DropdownMenu.Content align="start" forceMount asChild>
              <animated.div style={styles}>
                <Tag style={style} {...attributes} className={className.trim()}>
                  {children}
                </Tag>
              </animated.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        ) : null,
      )}
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
    menu$.actions.select(index);
  };
  return (
    <DropdownMenu.Item asChild>
      <Tag {...attributes} style={preapredStyle} onClick={onClick} onMouseOver={onHover} onMouseLeave={onMouseLeave}>
        <ContentRenderer content={isSelected ? selectedFormat : format} />
      </Tag>
    </DropdownMenu.Item>
  );
};
