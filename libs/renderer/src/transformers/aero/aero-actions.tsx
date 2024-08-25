import { Attributes, execSelectedAction, selectAction, selectedAction$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { actionContext } from '../../theme-core/actions';
import { ReactElement, ReactNode, useContext } from 'react';
import React from 'react';
import { aeroActionsWithParsedName$ } from '../../render-state';
import { Markup } from '@qspider/html-renderer';

export const AeroQspActionsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const actions = useAtom(aeroActionsWithParsedName$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-actions-list');
  return (
    <Tag style={style} {...attributes}>
      {actions.map((action, index) => {
        return (
          <actionContext.Provider value={{ action, index }} key={action.key}>
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
  const { action, index } = useContext(actionContext);
  const [Tag, style, { useFormat, useSelectedFormat, ...attributes }] = useAttributes(attrs, 'qsp-action');
  const actionImageUrl = action.image ? action.image : '';
  const preparedStyle = {
    ...style,
    '--action-image': action.image ? `url("${actionImageUrl}")` : '',
  };

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

  return (
    <Tag {...attributes} style={preparedStyle} onMouseOver={onHover} onMouseLeave={onMouseLeave} onClick={onClick}>
      <Markup content={action.name} />
    </Tag>
  );
};
