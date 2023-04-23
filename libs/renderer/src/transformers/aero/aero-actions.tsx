import { QspListItem } from '@qsp/wasm-engine';
import {
  actions$,
  Attributes,
  execSelectedAction,
  getResource,
  IMAGE_PLACEHOLDER,
  selectAction,
  selectedAction$,
  TEXT_PLACEHOLDER,
  useFormatVariable,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { TemplateRenderer } from '../../template-renderer';
import { actionContext } from '../../theme-core/actions';

export const AeroQspActionsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const actions = useAtom(actions$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-actions-list');
  return (
    <Tag style={style} {...attributes}>
      {actions.map((action, index) => {
        return <AeroQspActionItem action={action} index={index} key={index} />;
      })}
    </Tag>
  );
};

export const AeroQspActionItem: React.FC<{ action: QspListItem; index: number }> = ({ action, index }) => {
  const selectedAction = useAtom(selectedAction$);
  const { attrs, template } = useThemeTemplate('qsp_action');
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-action-item');
  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate('qsp_action_selected', 'qsp_action');
  const [SelectedTag, selectedStyle, { useFormat: useSelectedFormat, ...selectedAttributes }] = useAttributes(
    selectedAttrs,
    'qsp-action-item'
  );
  const actionImageUrl = action.image ? getResource(action.image).url : '';
  const preparedStyle = {
    ...style,
    '--action-image': action.image ? `url("${actionImageUrl}")` : '',
  };
  const preparedSelectedStyle = {
    ...selectedStyle,
    '--action-image': action.image ? `url("${actionImageUrl}")` : '',
  };

  const format = useFormatVariable(useFormat)
    .replace(TEXT_PLACEHOLDER, action.name)
    .replace(IMAGE_PLACEHOLDER, action.image ? actionImageUrl : '');
  const selectedFormat = useFormatVariable(useSelectedFormat)
    .replace(TEXT_PLACEHOLDER, action.name)
    .replace(IMAGE_PLACEHOLDER, action.image ? actionImageUrl : '');

  const onHover = (): void => {
    selectAction(index);
  };
  const onMouseLeave = (): void => {
    selectAction(-1);
  };
  const onClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.preventDefault();
    if (selectedAction$.value < 0) selectAction(index);
    execSelectedAction();
  };

  const isSelected = selectedAction === index;
  return (
    <actionContext.Provider value={{ action, index }}>
      {isSelected ? (
        <SelectedTag
          {...selectedAttributes}
          style={preparedSelectedStyle}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          {selectedFormat ? (
            <ContentRenderer content={selectedFormat} />
          ) : (
            <TemplateRenderer template={selectedTemplate} />
          )}
        </SelectedTag>
      ) : (
        <Tag {...attributes} style={preparedStyle} onMouseOver={onHover} onClick={onClick}>
          {format ? <ContentRenderer content={format} /> : <TemplateRenderer template={template} />}
        </Tag>
      )}
    </actionContext.Provider>
  );
};
