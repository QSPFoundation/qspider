import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';

const deviceChecks: Record<string, string> = {
  mobile: 'max-width: 600px',
  tablet: 'max-width: 1024px',
  desktop: 'min-width: 1025px',
  bigScreen: 'min-width: 1281px',
};

const defaultCheck = 'min-width: 200px'; // take all

export const QspDevice: React.FC<{
  type: string;
  children: ReactNode;
}> = ({ type, children }) => {
  const check = deviceChecks[type] ?? defaultCheck;
  const isExpectedDevice = useMediaQuery({ query: `(${check})` });
  if (!isExpectedDevice) return null;
  return <>{children}</>;
};
