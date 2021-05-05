import styled from '@emotion/styled';

export const Hr = styled.div<{ width: string; size: string; noshade: boolean }>`
  border-width: ${(props) => (Number(props.size) > 0 ? '1px' : '1px 0 0 0')};
  border-style: ${(props) => (props.noshade ? 'solid' : 'inset')};
  border-color: rgb(128, 128, 128);
  border-radius: 1px;
  height: ${(props) => props.size || 0}px;
  margin: 0.5em auto;
  width: ${(props) => props.width || '100%'};
  background-color: ${(props) => (props.noshade ? 'rgb(128, 128, 128)' : 'transparent')};
`;
