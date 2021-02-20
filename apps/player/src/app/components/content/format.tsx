import styled from '@emotion/styled';
import React from 'react';
import { useStyle } from '../../hooks/style';

export const I: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <i style={useStyle(style)} className={className}>
      {children}
    </i>
  );
};
export const B: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <b style={useStyle(style)} className={className}>
      {children}
    </b>
  );
};

const StyledStrike = styled.span`
  text-decoration: line-through;
`;

export const Strike: React.FC<{ className?: string; style: React.CSSProperties }> = ({
  style,
  className,
  children,
}) => {
  return (
    <StyledStrike style={useStyle(style)} className={className}>
      {children}
    </StyledStrike>
  );
};

const StyledBig = styled.span`
  font-size: larger;
`;

export const Big: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <StyledBig style={useStyle(style)} className={className}>
      {children}
    </StyledBig>
  );
};

export const StyledTt = styled.span`
  font-family: monospace;
`;

export const Tt: React.FC<{ className?: string; style: React.CSSProperties }> = ({ style, className, children }) => {
  return (
    <StyledTt style={useStyle(style)} className={className}>
      {children}
    </StyledTt>
  );
};
