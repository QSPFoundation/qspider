import React from 'react';
import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import { useStyle } from '../../hooks/style';

export const StyledCenter = styled.div<WithTheme>`
  text-align: center;
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
