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
  const { attrs, template } = useThemeTemplate('qsp_action');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-action-item');
  const preparedStyle = {
    ...style,
    '--action-image': `url(${getResource(action.image).url})`,
  };
  const onHover = (): void => {
    selectAction(index);
  };
  const onClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.preventDefault();
    execSelectedAction();
  };
  return (
    <actionContext.Provider value={{ action, index }}>
      <Tag {...attributes} style={preparedStyle} onMouseOver={onHover} onClick={onClick}>
        <TemplateRenderer template={template} {...attrs} />
      </Tag>
    </actionContext.Provider>
  );
};

export const QspActionName: React.FC = () => {
  const { action } = useContext(actionContext);
  return <ContentRenderer content={action.name} />;
};

export const QspActionImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { action } = useContext(actionContext);
  const [, style, attributes] = useAttributes(attrs, 'img');
  if (!action.image) return null;
  return <img alt="" style={style} {...attributes} src={getResource(action.image).url} />;
};

export const QspActionIndex: React.FC = () => {
  const { index } = useContext(actionContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index + 1}</>;
};