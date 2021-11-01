import styled from '@emotion/styled';

export const PanelWrapper = styled.div<{ size: number }>`
  max-width: 100%;
  max-height: 100%;
  flex-grow: ${(props): string => String(props.size * 100)};
  flex-shrink: 0;
  flex-basis: 0;
`;
