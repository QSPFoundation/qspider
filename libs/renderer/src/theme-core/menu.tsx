import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Attributes, menu$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactElement, ReactNode, useContext, useState } from 'react';
import { useAttributes } from '../content/attributes';
import { useClickCoordinates } from '../hooks/click-coordinates';
import React from 'react';
import { useFadeTransition } from '../hooks/fade-transition';
import { animated } from '@react-spring/web';
import { ListItemWithParsedContent, menuWithParsedName$ } from '../render-state';
import { Markup } from '@qspider/html-renderer';
import { menuEntries } from './menu-entries';
import { menuPlacement } from './menu-placement';

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
  const transitions = useFadeTransition(menu.isOpen);
  const { triggerStyle, align, side } = menuPlacement(showAs, showAt, offsetX, offsetY, coordinates);
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
  const entries = menuEntries(items);
  return (
    <Tag style={style} {...attributes}>
      {items.map((item, index) => {
        const entry = entries[index];
        return entry.separator ? (
          <qsp-menu-separator key={item.key} data-qsp="menu-separator" />
        ) : (
          <menuContext.Provider value={{ item, index, displayIndex: entry.displayIndex }} key={item.key}>
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
