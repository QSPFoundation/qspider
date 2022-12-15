import { Attributes, getResource, viewPath$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspView: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const { style = {}, ...preparedAttrs } = useAttributes(attributes, 'qsp-view');
  const path = useAtom(viewPath$);
  if (!path) return null;
  (style as any)['--view-image'] = `url(${getResource(path).url})`;
  return (
    <qsp-view {...preparedAttrs} style={style as React.CSSProperties}>
      {children}
    </qsp-view>
  );
};

export const QspViewImage: React.FC<{ attributes: Attributes }> = ({ attributes }) => {
  const preparedAttributes = useAttributes(attributes, 'img');
  const path = useAtom(viewPath$);
  if (!path) return null;
  return <img src={getResource(path).url} alt="" {...preparedAttributes} />;
};
