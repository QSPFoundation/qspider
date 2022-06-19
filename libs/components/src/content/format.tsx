import styled from '@emotion/styled';
import React from 'react';
import { useStyle } from '../hooks';
import { Attributes, useAttributes } from '../hooks/attributes';

const StyledStrike = styled.span`
  text-decoration: line-through;
`;

export const Strike: React.FC<{
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ style, className, children, attributes }) => {
  return (
    <StyledStrike {...useAttributes(attributes)} style={useStyle(style)} className={className}>
      {children}
    </StyledStrike>
  );
};

const StyledBig = styled.span`
  font-size: larger;
`;

export const Big: React.FC<{
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ style, className, children, attributes }) => {
  return (
    <StyledBig {...useAttributes(attributes)} style={useStyle(style)} className={className}>
      {children}
    </StyledBig>
  );
};

export const StyledTt = styled.span`
  font-family: monospace;
`;

export const Tt: React.FC<{
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ style, className, children, attributes }) => {
  return (
    <StyledTt {...useAttributes(attributes)} style={useStyle(style)} className={className}>
      {children}
    </StyledTt>
  );
};
