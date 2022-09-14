import styled from '@emotion/styled';
import { AeroContentRectangle } from './aero.types';

export const AeroPanel = styled.div<Partial<AeroContentRectangle> & { background?: string }>`
  position: absolute;
  left: ${(props): number => props.x || 0}px;
  top: ${(props): number => props.y || 0}px;
  width: ${(props): string => (props.width ? `${props.width}px` : 'auto')};
  height: ${(props): string => (props.height ? `${props.height}px` : 'auto')};

  white-space: pre-wrap;

  background-image: ${({ background }): string => (background ? `url("${background}")` : 'none')};
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;

  .os-host {
    width: 100%;
    height: 100%;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
`;
