import React from 'react';
import styled from '@emotion/styled';
import { useStyle } from '../hooks';

export const StyledCenter = styled.div`
  text-align: center;
  --text-align: center;
  width: 100%;

  & > table {
    margin: 0 auto;
  }
`;

export const Center: React.FC<{ className?: string; style: React.CSSProperties }> = ({
  style,
  className,
  children,
}) => {
  return (
    <StyledCenter style={useStyle(style)} className={className}>
      {children}
    </StyledCenter>
  );
};
