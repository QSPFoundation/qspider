import { QspListItem } from '@qsp/wasm-engine';
import {
  actions$,
  Attributes,
  execSelectedAction,
  getResource,
  isActsVisible$,
  selectAction,
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

export const QspActions: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
  const isVisible = useAtom(isActsVisible$);
  if (!isVisible) return null;
  return <qsp-actions {...preparedAttributes}>{children}</qsp-actions>;
};

export const QspActionsList: React.FC = () => {
  const actions = useAtom(actions$);
  return (
    <>
      {actions.map((action, index) => {
        return <QspActionItem action={action} index={index} key={index} />;
      })}
    </>
  );
};

export const QspActionItem: React.FC<{ action: QspListItem; index: number }> = ({ action, index }) => {
  const { attrs, template } = useThemeTemplate('qsp_action');
  const { tag, ...otherAttrs } = attrs;
  const { style = {}, ...preparedAttrs } = useAttributes(otherAttrs as Attributes);
  (style as any)['--action-image'] = `url(${getResource(action.image).url})`;
  const Tag = (tag || 'div') as 'div';
  const onHover = (): void => {
    selectAction(index);
  };
  const onClick: React.MouseEventHandler<HTMLDivElement> = (e): void => {
    e.preventDefault();
    execSelectedAction();
  };
  return (
    <actionContext.Provider value={{ action, index }}>
      <Tag {...preparedAttrs} style={style as React.CSSProperties} onMouseOver={onHover} onClick={onClick}>
        <TemplateRenderer template={template} {...attrs} />
      </Tag>
    </actionContext.Provider>
  );
};

export const QspActionName: React.FC = () => {
  const { action } = useContext(actionContext);
  return <ContentRenderer content={action.name} />;
};

export const QspActionImage: React.FC = () => {
  const { action } = useContext(actionContext);
  if (!action.image) return null;
  return <img src={getResource(action.image).url} alt="" />;
};

export const QspActionIndex: React.FC = () => {
  const { index } = useContext(actionContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};
