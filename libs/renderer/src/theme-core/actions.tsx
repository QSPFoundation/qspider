import { QspListItem } from '@qsp/wasm-engine';
import {
  actions$,
  Attributes,
  execSelectedAction,
  isActsVisible$,
  selectAction,
  selectedAction$,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { createContext, ReactElement, ReactNode, useContext } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import React from 'react';

export const actionContext = createContext<{ action: QspListItem; index: number }>({
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

export const QspActionsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
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

export const QspActionItem: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const selectedAction = useAtom(selectedAction$);
  const { action, index } = useContext(actionContext);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-action');
  const preparedStyle = {
    ...style,
    '--action-image': action.image ? `url("${action.image}")` : '',
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

  const isSelected = selectedAction === index;
  return (
    <Tag
      {...attributes}
      style={preparedStyle}
      data-qsp-selected={isSelected ? '' : null}
      onMouseOver={onHover}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </Tag>
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
  return <img alt="" style={style} {...attributes} src={action.image} />;
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
