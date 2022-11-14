import React from 'react';
import styled from '@emotion/styled';
import { useStyle } from '../hooks';
import { Attributes, useAttributes } from '../hooks/attributes';

export const fontSizeMap: Record<string, string> = {
  '-2': 'x-small',
  '-1': 'small',
  '+0': 'medium',
  '+1': 'large',
  '+2': 'x-large',
  '+3': 'xx-large',
  '+4': 'xxx-large',
  0: 'medium',
  1: 'x-small',
  2: 'small',
  3: 'medium',
  4: 'large',
  5: 'x-large',
  6: 'xx-large',
  7: 'xxx-large',
};

const StyledFont = styled.span<{ size: string | null }>`
  font-size: ${(props): string => (props.size != null ? fontSizeMap[props.size] || 'medium' : 'inherit')};
`;

export const Font: React.FC<{
  size: string | null;
  style: React.CSSProperties;
  className?: string;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ size, style, className, children, attributes }) => {
  return (
    <StyledFont {...useAttributes(attributes)} size={size} style={useStyle(style)} className={className}>
      {children}
    </StyledFont>
  );
};