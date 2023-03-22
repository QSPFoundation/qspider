import { QspListItem } from '@qsp/wasm-engine';
import {
  actions$,
  Attributes,
  execSelectedAction,
  getResource,
  IMAGE_PLACEHOLDER,
  isActsVisible$,
  selectAction,
  selectedAction$,
  TEXT_PLACEHOLDER,
  useFormat,
  useThemeTemplate,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactNode, useContext } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';

const actionContext = createContext<{ action: QspListItem; index: number }>({
  action: { name: 'unknown', image: '' },
  index: -1,
});

export const QspActions: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-actions');
  const isVisible = useAtom(isActsVisible$);
  if (!isVisible) return null;
  return (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};

export const QspActionsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const actions = useAtom(actions$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-actions-list');
  return (
    <Tag style={style} {...attributes}>
      {actions.map((action, index) => {
        return <QspActionItem action={action} index={index} key={index} />;
      })}
    </Tag>
  );
};

export const QspActionItem: React.FC<{ action: QspListItem; index: number }> = ({ action, index }) => {
  const selectedAction = useAtom(selectedAction$);
  const { attrs, template } = useThemeTemplate('qsp_action');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-action-item');
  const { attrs: selectedAttrs, template: selectedTemplate } = useThemeTemplate('qsp_action_selected', 'qsp_action');
  const [SelectedTag, selectedStyle, selectedAttributes] = useAttributes(selectedAttrs, 'qsp-action-item');
  const preparedStyle = {
    ...style,
    '--action-image': action.image ? `url(${getResource(action.image).url})` : '',
  };
  const preparedSelectedStyle = {
    ...selectedStyle,
    '--action-image': action.image ? `url(${getResource(action.image).url})` : '',
  };

  const format = useFormat(attributes['use-format'])
    .replace(TEXT_PLACEHOLDER, action.name)
    .replace(IMAGE_PLACEHOLDER, action.image ? action.image : '');
  const selectedFormat = useFormat(selectedAttributes['use-format'])
    .replace(TEXT_PLACEHOLDER, action.name)
    .replace(IMAGE_PLACEHOLDER, action.image ? action.image : '');

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

export const QspActionName: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-action-name');
  const { action } = useContext(actionContext);
  return (
    <Tag {...attributes} style={style}>
      <ContentRenderer content={action.name} />
    </Tag>
  );
};

export const QspActionImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { action } = useContext(actionContext);
  const [, style, attributes] = useAttributes(attrs, 'img', 'qsp-action-image');
  if (!action.image) return null;
  return <img alt="" style={style} {...attributes} src={getResource(action.image).url} />;
};

export const QspActionIndex: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-action-index');
  const { index } = useContext(actionContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <Tag {...attributes} style={style}>
      {index + 1}
    </Tag>
  );
};
