import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { QspListItem } from '@qsp/wasm-engine';
import { Attributes, getResource, menu$, selectMenuItem, useThemeTemplate } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactNode, useContext } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';
import { hooks } from '@qspider/components';

const menuContext = createContext<{ item: QspListItem; index: number }>({
  item: { name: 'unknown', image: '' },
  index: -1,
});

export const QspMenu: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu');
  const isVisible = useAtom(menu$);
  const coordinates = hooks.useClickCoordinates();
  if (!isVisible) return null;
  return (
    <DropdownMenu.Root open={true} onOpenChange={(): void => selectMenuItem(-1)}>
      <DropdownMenu.Trigger asChild>
        <div
          style={{
            position: 'fixed',
            left: coordinates.x || 0,
            top: coordinates.y || 0,
          }}
        ></div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <Tag style={style} {...attributes}>
            {children}
          </Tag>
          ;
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const QspMenuList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const menu = useAtom(menu$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-list');
  if (!menu) return null;
  return (
    <Tag style={style} {...attributes}>
      {menu.items.map((item, index) => {
        return item.name === '-' ? (
          <QspMenuSeparator key={index} />
        ) : (
          <QspMenuItem item={item} index={index} key={index} />
        );
      })}
    </Tag>
  );
};

export const QspMenuItem: React.FC<{ item: QspListItem; index: number }> = ({ item, index }) => {
  const { attrs, template } = useThemeTemplate('qsp_menu_item');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-item');
  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url(${getResource(item.image).url})` : 'none',
  } as React.CSSProperties;
  const onClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.preventDefault();
    selectMenuItem(index);
  };
  return (
    <menuContext.Provider value={{ item, index }}>
      <DropdownMenu.Item asChild>
        <Tag {...attributes} style={preapredStyle} onClick={onClick}>
          <TemplateRenderer template={template} />
        </Tag>
      </DropdownMenu.Item>
    </menuContext.Provider>
  );
};

export const QspMenuItemName: React.FC = () => {
  const { item } = useContext(menuContext);
  return <ContentRenderer content={item.name} />;
};

export const QspMenuItemImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { item } = useContext(menuContext);
  const [, style, attributes] = useAttributes(attrs, 'img');
  if (!item.image) return null;
  return <img alt="" {...attributes} style={style} src={getResource(item.image).url} />;
};

export const QspMenuItemIndex: React.FC = () => {
  const { index } = useContext(menuContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};

export const QspMenuSeparator: React.FC = () => {
  const { attrs, template } = useThemeTemplate('qsp_menu_separator');
  const [Tag, style, attributes] = useAttributes(attrs, 'div');
  return (
    <DropdownMenu.Separator asChild>
      <Tag style={style} {...attributes}>
        <TemplateRenderer template={template} />
      </Tag>
    </DropdownMenu.Separator>
  );
};
