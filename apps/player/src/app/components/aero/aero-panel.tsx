import styled from '@emotion/styled';
import { AeroContentRectangle } from '@qspider/qsp-wasm';

export const AeroPanel = styled.div<Partial<AeroContentRectangle> & { background?: string }>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;

  white-space: pre-wrap;

  background-image: ${({ background }) => (background ? `url("${background}")` : 'none')};
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
