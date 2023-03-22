import { QspListItem } from '@qsp/wasm-engine';
import {
  Attributes,
  getResource,
  IMAGE_PLACEHOLDER,
  isObjsVisible$,
  objects$,
  selectObject,
  TEXT_PLACEHOLDER,
  useFormat,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactNode, useContext, useState } from 'react';
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
  const [isSelected, setIsSelected] = useState(false);
  const { attrs, template } = useThemeTemplate('qsp_object');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-object-item');

  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate('qsp_object_selected', 'qsp_object');
  const [SelectedTag, selectedStyle, selectedAttributes] = useAttributes(selectedAttrs, 'qsp-object-item');

  const preparedStyle = {
    ...style,
    '--object-image': object.image ? `url(${getResource(object.image).url})` : '',
  };
  const preparedSelectedStyle = {
    ...selectedStyle,
    '--object-image': object.image ? `url(${getResource(object.image).url})` : '',
  };

  const format = useFormat(attributes['use-format'])
    .replace(TEXT_PLACEHOLDER, object.name)
    .replace(IMAGE_PLACEHOLDER, object.image ? object.image : '');
  const selectedFormat = useFormat(selectedAttributes['use-format'])
    .replace(TEXT_PLACEHOLDER, object.name)
    .replace(IMAGE_PLACEHOLDER, object.image ? object.image : '');

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
    <objectContext.Provider value={{ object, index }}>
      {isSelected ? (
        <SelectedTag
          {...selectedAttributes}
          style={preparedSelectedStyle}
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
        <Tag {...attributes} style={preparedStyle} onClick={onClick} onMouseOver={onHover}>
          {format ? <ContentRenderer content={format} /> : <TemplateRenderer template={template} />}
        </Tag>
      )}
    </objectContext.Provider>
  );
};

export const QspObjectName: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-object-index');
  const { object } = useContext(objectContext);
  return (
    <Tag {...attributes} style={style}>
      <ContentRenderer content={object.name} />
    </Tag>
  );
};

export const QspObjectImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { object } = useContext(objectContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'img', 'qsp-object-image');
  if (!object.image) return null;
  return <Tag {...attributes} style={style} src={getResource(object.image).url} />;
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
