import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { QspListItem } from '@qsp/wasm-engine';
import {
  Attributes,
  getResource,
  IMAGE_PLACEHOLDER,
  menu$,
  selectMenuItem,
  TEXT_PLACEHOLDER,
  useFormatVariable,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, CSSProperties, ReactNode, useContext, useState } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';
import { useClickCoordinates } from '../hooks/click-coordinates';

const menuContext = createContext<{ item: QspListItem; index: number; displayIndex: number }>({
  item: { name: 'unknown', image: '' },
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
  const isVisible = useAtom(menu$);
  const coordinates = useClickCoordinates();
  const triggerStyle: CSSProperties = { position: 'fixed' };
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
  if (!isVisible) return null;
  return (
    <DropdownMenu.Root open={true} onOpenChange={(): void => selectMenuItem(-1)}>
      <DropdownMenu.Trigger asChild>
        <div style={triggerStyle}></div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={document.getElementById('portal-container')}>
        <DropdownMenu.Content align={align} side={side} loop>
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
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-menu-item');

  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate(
    'qsp_menu_item_selected',
    'qsp_menu_item'
  );
  const [SelectedTag, selectedStyle, { useFormat: useSelectedFormat, ...selectedAttributes }] = useAttributes(
    selectedAttrs,
    'qsp-menu-item'
  );

  const preapredStyle = {
    ...style,
    '--menu-item-image': item.image ? `url("${getResource(item.image).url}")` : '',
  } as React.CSSProperties;
  const preapredSelectedStyle = {
    ...selectedStyle,
    '--menu-item-image': item.image ? `url("${getResource(item.image).url}")` : '',
  } as React.CSSProperties;

  const format = useFormatVariable(useFormat)
    .replace(TEXT_PLACEHOLDER, item.name)
    .replace(IMAGE_PLACEHOLDER, item.image ? item.image : '');
  const selectedFormat = useFormatVariable(useSelectedFormat)
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

export const QspMenuItemName: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { item } = useContext(menuContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu-name');
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={item.name} />
    </Tag>
  );
};

export const QspMenuItemImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { item } = useContext(menuContext);
  const [, style, attributes] = useAttributes(attrs, 'img', 'qsp-menu-image');
  if (!item.image) return null;
  return <img alt="" {...attributes} style={style} src={getResource(item.image).url} />;
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

export const QspMenuSeparator: React.FC = () => {
  const { attrs, template } = useThemeTemplate('qsp_menu_separator');
  const [Tag, style, attributes] = useAttributes(attrs, 'div', 'qsp-menu-separator');
  return (
    <DropdownMenu.Separator asChild>
      <Tag style={style} {...attributes}>
        <TemplateRenderer template={template} />
      </Tag>
    </DropdownMenu.Separator>
  );
};
