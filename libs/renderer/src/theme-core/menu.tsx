import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { QspListItem } from '@qsp/wasm-engine';
import {
  Attributes,
  getResource,
  IMAGE_PLACEHOLDER,
  menu$,
  selectMenuItem,
  TEXT_PLACEHOLDER,
  useFormat,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';
import { hooks } from '@qspider/components';

const menuContext = createContext<{ item: QspListItem; index: number; displayIndex: number }>({
  item: { name: 'unknown', image: '' },
  index: -1,
  displayIndex: -1,
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
      <DropdownMenu.Portal container={document.getElementById('portal-container')}>
        <DropdownMenu.Content align="start">
          <Tag style={style} {...attributes}>
            {children}
          </Tag>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const QspMenuList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const menu = useAtom(menu$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-list');
  if (!menu) return null;
  let displayIndex = 1;
  return (
    <Tag style={style} {...attributes}>
      {menu.items.map((item, index) => {
        return item.name === '-' ? (
          <QspMenuSeparator key={index} />
        ) : (
          <QspMenuItem item={item} index={index} key={index} displayIndex={displayIndex++} />
        );
      })}
    </Tag>
  );
};

export const QspMenuItem: React.FC<{ item: QspListItem; index: number; displayIndex: number }> = ({
  item,
  index,
  displayIndex,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const { attrs, template } = useThemeTemplate('qsp_menu_item');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-item');

  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate(
    'qsp_menu_item_selected',
    'qsp_menu_item'
  );
  const [SelectedTag, selectedStyle, selectedAttributes] = useAttributes(selectedAttrs, 'qsp-menu-item');

  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url(${getResource(item.image).url})` : '',
  } as React.CSSProperties;
  const preapredSelectedStyle = {
    ...selectedStyle,
    '--menu-item-image': item.image ? `url(${getResource(item.image).url})` : '',
  } as React.CSSProperties;

  const format = useFormat(attributes['use-format'])
    .replace(TEXT_PLACEHOLDER, item.name)
    .replace(IMAGE_PLACEHOLDER, item.image ? item.image : '');
  const selectedFormat = useFormat(selectedAttributes['use-format'])
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
    <menuContext.Provider value={{ item, index, displayIndex }}>
      <DropdownMenu.Item asChild>
        {isSelected ? (
          <SelectedTag
            {...selectedAttributes}
            style={preapredSelectedStyle}
            onClick={onClick}
            onMouseLeave={onMouseLeave}
          >
            {selectedFormat ? (
              <ContentRenderer content={selectedFormat} />
            ) : (
              <TemplateRenderer template={selectedTemplate} />
            )}
          </SelectedTag>
        ) : (
          <Tag {...attributes} style={preapredStyle} onClick={onClick} onMouseOver={onHover}>
            {format ? <ContentRenderer content={format} /> : <TemplateRenderer template={template} />}
          </Tag>
        )}
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
  const { displayIndex } = useContext(menuContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{displayIndex}</>;
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
