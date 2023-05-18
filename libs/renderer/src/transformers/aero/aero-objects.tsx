import {
  Attributes,
  DEFAULT_LIST_FORMAT,
  DEFAULT_SELECTED_LIST_FORMAT,
  getResource,
  IMAGE_PLACEHOLDER,
  selectObject,
  TEXT_PLACEHOLDER,
  useFormatVariable,
} from '@qspider/game-state';
import { ReactNode, useContext, useState } from 'react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { objectContext } from '../../theme-core/objects';

export const AeroQspObjectItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-object');
  const { object, index } = useContext(objectContext);

  const preparedStyle = {
    ...style,
    '--object-image': object.image ? `url("${getResource(object.image).url}")` : '',
  };

  const format = useFormatVariable(useFormat, DEFAULT_LIST_FORMAT)
    .replace(TEXT_PLACEHOLDER, object.name)
    .replace(IMAGE_PLACEHOLDER, object.image ? object.image : '');
  const selectedFormat = useFormatVariable(useSelectedFormat, DEFAULT_SELECTED_LIST_FORMAT)
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
    <Tag {...attributes} style={preparedStyle} onClick={onClick} onMouseOver={onHover} onMouseLeave={onMouseLeave}>
      <ContentRenderer content={isSelected ? selectedFormat : format} />
    </Tag>
  );
};
