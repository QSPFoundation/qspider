import {
  actions$,
  Attributes,
  DEFAULT_LIST_FORMAT,
  DEFAULT_SELECTED_LIST_FORMAT,
  execSelectedAction,
  getResource,
  IMAGE_PLACEHOLDER,
  selectAction,
  selectedAction$,
  TEXT_PLACEHOLDER,
  useFormatVariable,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { actionContext } from '../../theme-core/actions';
import { ReactElement, ReactNode, useContext } from 'react';
import React from 'react';

export const AeroQspActionsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const actions = useAtom(actions$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-actions-list');
  return (
    <Tag style={style} {...attributes}>
      {actions.map((action, index) => {
        return (
          <actionContext.Provider value={{ action, index }} key={index}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </actionContext.Provider>
        );
      })}
    </Tag>
  );
};

export const AeroQspActionItem: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const selectedAction = useAtom(selectedAction$);
  const { action, index } = useContext(actionContext);
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-action');
  const actionImageUrl = action.image ? getResource(action.image).url : '';
  const preparedStyle = {
    ...style,
    '--action-image': action.image ? `url("${actionImageUrl}")` : '',
  };

  const format = useFormatVariable(useFormat, DEFAULT_LIST_FORMAT)
    .replace(TEXT_PLACEHOLDER, action.name)
    .replace(IMAGE_PLACEHOLDER, action.image ? actionImageUrl : '');
  const selectedFormat = useFormatVariable(useSelectedFormat, DEFAULT_SELECTED_LIST_FORMAT)
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
    <Tag {...attributes} style={preparedStyle} onMouseOver={onHover} onMouseLeave={onMouseLeave} onClick={onClick}>
      <ContentRenderer content={isSelected ? selectedFormat : format} />
    </Tag>
  );
};
