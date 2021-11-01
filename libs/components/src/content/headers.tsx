import React from 'react';
import { useStyle } from '../../hooks/style';

export const H1: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h1 style={useStyle(style)} className={className}>
      {children}
    </h1>
  );
};
export const H2: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h2 style={useStyle(style)} className={className}>
      {children}
    </h2>
  );
};
export const H3: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h3 style={useStyle(style)} className={className}>
      {children}
    </h3>
  );
};

export const H4: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h4 style={useStyle(style)} className={className}>
      {children}
    </h4>
  );
};
export const H5: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h5 style={useStyle(style)} className={className}>
      {children}
    </h5>
  );
};
export const H6: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <h6 style={useStyle(style)} className={className}>
      {children}
    </h6>
  );
};
