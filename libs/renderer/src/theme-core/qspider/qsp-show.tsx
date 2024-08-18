import { useQspExpression } from '@qspider/game-state';
import { ReactNode } from 'react';

export const QspShow: React.FC<{ condition: string; children: ReactNode }> = ({ condition, children }) => {
  const shouldShow = useQspExpression(condition || '');
  if (!shouldShow) return null;
  return children;
};
