import { Attributes, selectedObject$, selectObject } from '@qspider/game-state';
import { ReactElement, ReactNode, useContext } from 'react';
import { useAttributes } from '../../content/attributes';
import { objectContext } from '../../theme-core/objects';
import { Markup } from '@qspider/html-renderer';
import { useAtom } from '@xoid/react';
import { aeroObjectsWithParsedName$ } from '../../render-state';
import React from 'react';

export const AeroQspObjectsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const objects = useAtom(aeroObjectsWithParsedName$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-objects-list');
  return (
    <Tag style={style} {...attributes}>
      {objects.map((object, index) => {
        return (
          <objectContext.Provider value={{ object, index }} key={index}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </objectContext.Provider>
        );
      })}
    </Tag>
  );
};

export const AeroQspObjectItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs }) => {
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-object');
  const { object, index } = useContext(objectContext);

  const preparedStyle = {
    ...style,
    '--object-image': object.image ? `url("${object.image}")` : '',
  };

  const onHover = (): void => {
    selectedObject$.set(index);
  };
  const onMouseLeave = (): void => {
    selectedObject$.set(-1);
  };
  const onClick = (): void => {
    selectObject(index);
  };
  return (
    <Tag {...attributes} style={preparedStyle} onClick={onClick} onMouseOver={onHover} onMouseLeave={onMouseLeave}>
      <Markup content={object.name} />
    </Tag>
  );
};
