import styled from '@emotion/styled';

export const Hr = styled.div<{ width: string | null; size: string | null; noshade: boolean }>`
  border-width: ${(props): string => (Number(props.size) > 0 ? '1px' : '1px 0 0 0')};
  border-style: ${(props): string => (props.noshade ? 'solid' : 'inset')};
  border-color: rgb(128, 128, 128);
  border-radius: 1px;
  height: ${(props): string => props.size || '0'}px;
  margin: 0.5em auto;
  width: ${(props): string => props.width || '100%'};
  background-color: ${(props): string => (props.noshade ? 'rgb(128, 128, 128)' : 'transparent')};
`;
