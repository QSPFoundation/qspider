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

export const QspObjectsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const objects = useAtom(objects$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-objects-list');
  return (
    <Tag style={style} {...attributes}>
      {objects.map((object, index) => {
        return <QspObjectItem object={object} index={index} key={index} />;
      })}
    </Tag>
  );
};

export const QspObjectItem: React.FC<{ object: QspListItem; index: number }> = ({ object, index }) => {
  const { attrs, template } = useThemeTemplate('qsp_object');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-object-item');
  const preparedStyle = {
    ...style,
    '--object-image': `url(${getResource(object.image).url})`,
  };
  const onClick = (): void => {
    selectObject(index);
  };
  return (
    <objectContext.Provider value={{ object, index }}>
      <Tag {...attributes} style={preparedStyle} onClick={onClick}>
        <TemplateRenderer template={template} {...attrs} />
      </Tag>
    </objectContext.Provider>
  );
};

export const QspObjectName: React.FC = () => {
  const { object } = useContext(objectContext);
  return <ContentRenderer content={object.name} />;
};

export const QspObjectImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { object } = useContext(objectContext);
  const [, style, attributes] = useAttributes(attrs, 'img');
  if (!object.image) return null;
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...attributes} style={style} src={getResource(object.image).url} />;
};

export const QspObjectIndex: React.FC = () => {
  const { index } = useContext(objectContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};
