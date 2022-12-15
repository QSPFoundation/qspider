import { Attributes, isStatsVisible$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspStats: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes, 'qsp-stats');
  const isVisible = useAtom(isStatsVisible$);
  if (!isVisible) return null;
  return <qsp-stats {...preparedAttributes}>{children}</qsp-stats>;
};
