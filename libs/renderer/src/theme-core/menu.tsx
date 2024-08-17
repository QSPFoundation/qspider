import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Attributes, menu$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, CSSProperties, ReactElement, ReactNode, useContext, useState } from 'react';
import { useAttributes } from '../content/attributes';
import { useClickCoordinates } from '../hooks/click-coordinates';
import React from 'react';
import { useFadeTransition } from '../hooks/fade-transition';
import { animated } from '@react-spring/web';
import { ListItemWithParsedContent, menuWithParsedName$ } from '../render-state';
import { Markup } from '@qspider/html-renderer';

export const menuContext = createContext<{ item: ListItemWithParsedContent; index: number; displayIndex: number }>({
  item: { name: [], image: '' },
  index: -1,
  displayIndex: -1,
});

export const QspMenu: React.FC<{
  showAs: 'mouse' | 'fixed';
  showAt?: string;
  offsetX: number;
  offsetY: number;
  attrs: Attributes;
  children: ReactNode;
}> = ({ attrs, showAs, showAt, offsetX, offsetY, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu');
  const menu = useAtom(menu$);
  const coordinates = useClickCoordinates();
  const triggerStyle: CSSProperties = { position: 'fixed' };
  const transitions = useFadeTransition(menu.isOpen);
  let align: 'center' | 'start' | 'end' = 'start';
  let side: 'bottom' | 'left' | 'right' | 'top' = 'bottom';
  if (showAs === 'fixed') {
    const [x, y] = (showAt ?? 'left top').split(' ');
    switch (x) {
      case 'left':
        triggerStyle.left = offsetX;
        break;
      case 'center':
        triggerStyle.left = `calc(50% - ${offsetX}px)`;
        align = 'center';
        break;
      case 'right':
        triggerStyle.right = offsetX;
        align = 'end';
        break;
    }
    switch (y) {
      case 'top':
        triggerStyle.top = offsetY;
        break;
      case 'center':
        triggerStyle.top = `calc(50% - ${offsetY}px)`;
        side = 'left';
        break;
      case 'bottom':
        triggerStyle.bottom = offsetY;
        side = 'top';
        break;
    }
  } else {
    triggerStyle.left = coordinates.x ?? 0;
    triggerStyle.top = coordinates.y ?? 0;
  }
  return (
    <DropdownMenu.Root open={menu.isOpen} onOpenChange={(): void => menu$.actions.close()}>
      <DropdownMenu.Trigger asChild>
        <div style={triggerStyle}></div>
      </DropdownMenu.Trigger>
      {transitions((styles, item) => {
        return item ? (
          <DropdownMenu.Portal container={document.getElementById('portal-container')}>
            <DropdownMenu.Content forceMount asChild align={align} side={side} loop>
              <animated.div style={styles}>
                <Tag style={style} {...attributes}>
                  {children}
                </Tag>
              </animated.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        ) : null;
      })}
    </DropdownMenu.Root>
  );
};

export const QspMenuList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const items = useAtom(menuWithParsedName$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-list');
  let displayIndex = 1;
  return (
    <Tag style={style} {...attributes}>
      {items.map((item, index) => {
        return item.name[0] === '-' ? (
          <qsp-menu-separator key={index} />
        ) : (
          <menuContext.Provider value={{ item, index, displayIndex: displayIndex++ }} key={index}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </menuContext.Provider>
        );
      })}
    </Tag>
  );
};

export const QspMenuItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-menu-item');
  const { item, index } = useContext(menuContext);

  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url("${item.image}")` : '',
  } as React.CSSProperties;

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
      <Tag
        {...attributes}
        style={preapredStyle}
        data-qsp-selected={isSelected ? '' : null}
        onClick={onClick}
        onMouseOver={onHover}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </Tag>
    </DropdownMenu.Item>
  );
};

export const QspMenuItemName: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { item } = useContext(menuContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-name');
  return (
    <Tag style={style} {...attributes}>
      <Markup content={item.name} />
    </Tag>
  );
};

export const QspMenuItemImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { item } = useContext(menuContext);
  const [, style, attributes] = useAttributes(attrs, 'img', 'qsp-menu-image');
  if (!item.image) return null;
  return <img alt="" {...attributes} style={style} src={item.image} />;
};

export const QspMenuItemIndex: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { displayIndex } = useContext(menuContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-index');
  return (
    <Tag style={style} {...attributes}>
      {displayIndex}
    </Tag>
  );
};
