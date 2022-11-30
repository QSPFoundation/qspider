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

export const QspMenu: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
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
          <qsp-menu {...preparedAttributes}>{children}</qsp-menu>;
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const QspMenuList: React.FC = () => {
  const menu = useAtom(menu$);
  if (!menu) return null;
  return (
    <>
      {menu.items.map((item, index) => {
        return item.name === '-' ? (
          <QspMenuSeparator key={index} />
        ) : (
          <QspMenuItem item={item} index={index} key={index} />
        );
      })}
    </>
  );
};

export const QspMenuItem: React.FC<{ item: QspListItem; index: number }> = ({ item, index }) => {
  const { attrs, template } = useThemeTemplate('qsp_menu_item');
  const { tag, ...otherAttrs } = attrs;
  const { style, ...preparedAttrs } = useAttributes(otherAttrs as Attributes);
  const preapredStyle = {
    ...(style as object),
    '--menu-item-image': item.image ? `url(${getResource(item.image).url})` : 'none',
  } as React.CSSProperties;
  const Tag = (tag || 'div') as 'div';
  const onClick: React.MouseEventHandler<HTMLDivElement> = (e): void => {
    e.preventDefault();
    selectMenuItem(index);
  };
  return (
    <menuContext.Provider value={{ item, index }}>
      <DropdownMenu.Item asChild>
        <Tag {...preparedAttrs} style={preapredStyle} onClick={onClick}>
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

export const QspMenuItemImage: React.FC = () => {
  const { item } = useContext(menuContext);
  if (!item.image) return null;
  return <img src={getResource(item.image).url} alt="" />;
};

export const QspMenuItemIndex: React.FC = () => {
  const { index } = useContext(menuContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};

export const QspMenuSeparator: React.FC = () => {
  const { attrs, template } = useThemeTemplate('qsp_menu_separator');
  const { tag, ...otherAttrs } = attrs;
  const preparedAttrs = useAttributes(otherAttrs);
  const Tag = (tag || 'div') as 'div';
  return (
    <DropdownMenu.Separator asChild>
      <Tag {...preparedAttrs}>
        <TemplateRenderer template={template} />
      </Tag>
    </DropdownMenu.Separator>
  );
};
