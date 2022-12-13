import { useQspExpression } from '@qspider/game-state';
import { ReactNode } from 'react';

export const QspShow: React.FC<{ condition: string; children: ReactNode }> = ({ condition, children }) => {
  const shouldShow = useQspExpression(condition || '');
  if (!shouldShow) return null;
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
