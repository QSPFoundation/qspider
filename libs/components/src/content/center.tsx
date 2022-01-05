import React from 'react';
import { useStyle } from '../hooks';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      center: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export const Center: React.FC<{ className?: string; style: React.CSSProperties }> = ({
  style,
  className,
  children,
}) => {
  return (
    <center style={useStyle(style)} className={className}>
      {children}
    </center>
  );
};
