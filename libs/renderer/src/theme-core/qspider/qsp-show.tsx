import { useQspExpression } from '@qspider/game-state';
import { ReactNode } from 'react';

export const QspShow: React.FC<{ variable: string; condition: [string, string]; children: ReactNode }> = ({
  variable,
  condition,
  children,
}) => {
  const shouldShow = useQspExpression(variable, condition);
  if (!shouldShow) return null;
  return children;
};
