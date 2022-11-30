import { QspListItem } from '@qsp/wasm-engine';
import { Attributes, getResource, isObjsVisible$, objects$, selectObject, useThemeTemplate } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactNode, useContext } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';

const objectContext = createContext<{ object: QspListItem; index: number }>({
  object: { name: 'unknown', image: '' },
  index: -1,
});

export const QspObjects: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
  const isVisible = useAtom(isObjsVisible$);
  if (!isVisible) return null;
  return <qsp-objects {...preparedAttributes}>{children}</qsp-objects>;
};

export const QspObjectsList: React.FC = () => {
  const objects = useAtom(objects$);
  return (
    <>
      {objects.map((object, index) => {
        return <QspObjectItem object={object} index={index} key={index} />;
      })}
    </>
  );
};

export const QspObjectItem: React.FC<{ object: QspListItem; index: number }> = ({ object, index }) => {
  const { attrs, template } = useThemeTemplate('qsp_object');
  const { tag, ...otherAttrs } = attrs;
  const { style = {}, ...preparedAttrs } = useAttributes(otherAttrs as Attributes);
  (style as any)['--object-image'] = `url(${getResource(object.image).url})`;
  const Tag = (tag || 'div') as 'div';
  const onClick: React.MouseEventHandler<HTMLDivElement> = (e): void => {
    selectObject(index);
  };
  return (
    <objectContext.Provider value={{ object, index }}>
      <Tag {...preparedAttrs} style={style as React.CSSProperties} onClick={onClick}>
        <TemplateRenderer template={template} {...attrs} />
      </Tag>
    </objectContext.Provider>
  );
};

export const QspObjectName: React.FC = () => {
  const { object } = useContext(objectContext);
  return <ContentRenderer content={object.name} />;
};

export const QspObjectImage: React.FC = () => {
  const { object } = useContext(objectContext);
  if (!object.image) return null;
  return <img src={getResource(object.image).url} alt="" />;
};

export const QspObjectIndex: React.FC = () => {
  const { index } = useContext(objectContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};
