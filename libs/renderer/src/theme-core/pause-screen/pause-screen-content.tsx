import { Attributes } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenContent: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-content');
  return (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};
