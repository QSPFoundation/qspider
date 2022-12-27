import { Attributes, getResource, viewPath$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspView: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-view');
  const path = useAtom(viewPath$);
  if (!path) return null;
  const preparedStyle = {
    ...style,
    '--view-image': `url(${getResource(path).url})`,
  };
  return (
    <Tag {...attributes} style={preparedStyle}>
      {children}
    </Tag>
  );
};

export const QspViewImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'img');
  const path = useAtom(viewPath$);
  if (!path) return null;
  return <img src={getResource(path).url} alt="" style={style} {...attributes} />;
};