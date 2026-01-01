import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';

export const QspOrientation: React.FC<{
  type: string;
  children: ReactNode;
}> = ({ children, type }) => {
  const isExpectedOrientation = useMediaQuery({ query: `(orientation: ${type})` });
  if (!isExpectedOrientation) return null;
  return <>{children}</>;
};
