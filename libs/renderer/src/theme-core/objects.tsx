import { Attributes, isObjsVisible$, selectObject } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactElement, ReactNode, useContext, useState } from 'react';
import { useAttributes } from '../content/attributes';

import React from 'react';
import { ListItemWithParsedContent, objectsWithParsedName$ } from '../render-state';
import { Markup } from '@qspider/html-renderer';

export const objectContext = createContext<{ object: ListItemWithParsedContent; index: number }>({
  object: { name: [], image: '' },
  index: -1,
});

export const QspObjects: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-objects');
  const isVisible = useAtom(isObjsVisible$);
  if (!isVisible) return null;
  return (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};

export const QspObjectsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const objects = useAtom(objectsWithParsedName$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-objects-list');
  return (
    <Tag style={style} {...attributes}>
      {objects.map((object, index) => {
        return (
          <objectContext.Provider value={{ object, index }} key={object.key}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </objectContext.Provider>
        );
      })}
    </Tag>
  );
};

export const QspObjectItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-object');
  const { object, index } = useContext(objectContext);

  const preparedStyle = {
    ...style,
    '--object-image': object.image ? `url("${object.image}")` : '',
  };
  const onHover = (): void => {
    setIsSelected(true);
  };
  const onMouseLeave = (): void => {
    setIsSelected(false);
  };
  const onClick = (): void => {
    selectObject(index);
  };
  return (
    <Tag
      {...attributes}
      style={preparedStyle}
      data-qsp-selected={isSelected ? '' : null}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Tag>
  );
};

export const QspObjectName: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-object-name');
  const { object } = useContext(objectContext);
  return (
    <Tag {...attributes} style={style}>
      <Markup content={object.name} />
    </Tag>
  );
};

export const QspObjectImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { object } = useContext(objectContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'img', 'qsp-object-image');
  if (!object.image) return null;
  return <Tag {...attributes} style={style} src={object.image} />;
};

export const QspObjectIndex: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { index } = useContext(objectContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-object-index');
  return (
    <Tag {...attributes} style={style}>
      {index + 1}
    </Tag>
  );
};
