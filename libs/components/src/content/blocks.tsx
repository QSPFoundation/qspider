import React from 'react';
import { useStyle } from '../hooks';

export const Div: React.FC<{ id?: string; className?: string; style: React.CSSProperties }> = ({
  id,
  style,
  className,
  children,
}) => {
  return (
    <div id={id} style={useStyle(style)} className={className}>
      {children}
    </div>
  );
};

export const P: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <p style={useStyle(style)} className={className}>
      {children}
    </p>
  );
};
