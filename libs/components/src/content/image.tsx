import styled from '@emotion/styled';
import { useResources } from '@qspider/providers';
import React from 'react';
import { useStyle } from '../hooks';

const StyledImage = styled.img``;

export const Image: React.FC<{
  src: string;
  className?: string;
  useMap?: string;
  style: React.CSSProperties;
}> = ({ src, useMap, style, className }) => {
  const resources = useResources();
  return (
    <StyledImage
      src={`${resources.get(src).url}`}
      style={useStyle(style)}
      useMap={useMap}
      className={className}
      alt=""
    />
  );
};
