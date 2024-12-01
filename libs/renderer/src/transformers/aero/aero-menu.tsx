import { Attributes, menu$, selectedMenuItem$, useQspVariable } from '@qspider/game-state';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAtom } from '@xoid/react';
import { ReactElement, ReactNode, useContext } from 'react';
import { animated } from '@react-spring/web';
import { useAttributes } from '../../content/attributes';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { menuContext } from '../../theme-core/menu';
import { useAeroEffect } from './use-aero-effect';
import { Markup } from '@qspider/html-renderer';
import { aeroMenuWithParsedName$ } from '../../render-state';
import React from 'react';

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
          data-menu-trigger
          style={{
            position: 'absolute',
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

export const AeroQspMenuList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const items = useAtom(aeroMenuWithParsedName$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-list');
  let displayIndex = 1;
  return (
    <Tag style={style} {...attributes}>
      {items.map((item, index) => {
        return item.name[0] === '-' ? (
          <qsp-menu-separator key={item.key} />
        ) : (
          <menuContext.Provider value={{ item, index, displayIndex: displayIndex++ }} key={item.key}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </menuContext.Provider>
        );
      })}
    </Tag>
  );
};

export const AeroQspMenuItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs }) => {
  const { item, index } = useContext(menuContext);
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-menu-item');

  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url("${item.image}")` : '',
  } as React.CSSProperties;

  const onHover = (): void => {
    selectedMenuItem$.set(index);
  };
  const onMouseLeave = (): void => {
    selectedMenuItem$.set(-1);
  };
  const onClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.preventDefault();
    menu$.actions.select(index);
  };
  return (
    <DropdownMenu.Item asChild>
      <Tag {...attributes} style={preapredStyle} onClick={onClick} onMouseOver={onHover} onMouseLeave={onMouseLeave}>
        <Markup content={item.name} />
      </Tag>
    </DropdownMenu.Item>
  );
};
