import { Attributes, isStatsVisible$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspStats: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-stats');
  const isVisible = useAtom(isStatsVisible$);
  if (!isVisible) return null;
  return (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};
