import { QspListItem } from '@qsp/wasm-engine';
import {
  Attributes,
  getResource,
  IMAGE_PLACEHOLDER,
  objects$,
  selectObject,
  TEXT_PLACEHOLDER,
  useFormatVariable,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useState } from 'react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { TemplateRenderer } from '../../template-renderer';
import { objectContext } from '../../theme-core/objects';

export const AeroQspObjectsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const objects = useAtom(objects$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-objects-list');
  return (
    <Tag style={style} {...attributes}>
      {objects.map((object, index) => {
        return <AeroQspObjectItem object={object} index={index} key={index} />;
      })}
    </Tag>
  );
};

export const AeroQspObjectItem: React.FC<{ object: QspListItem; index: number }> = ({ object, index }) => {
  const [isSelected, setIsSelected] = useState(false);
  const { attrs, template } = useThemeTemplate('qsp_object');
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-object-item');

  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate('qsp_object_selected', 'qsp_object');
  const [SelectedTag, selectedStyle, { useFormat: useSelectedFormat, ...selectedAttributes }] = useAttributes(
    selectedAttrs,
    'qsp-object-item'
  );

  const preparedStyle = {
    ...style,
    '--object-image': object.image ? `url("${getResource(object.image).url}")` : '',
  };
  const preparedSelectedStyle = {
    ...selectedStyle,
    '--object-image': object.image ? `url("${getResource(object.image).url}")` : '',
  };

  const format = useFormatVariable(useFormat)
    .replace(TEXT_PLACEHOLDER, object.name)
    .replace(IMAGE_PLACEHOLDER, object.image ? object.image : '');
  const selectedFormat = useFormatVariable(useSelectedFormat)
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
