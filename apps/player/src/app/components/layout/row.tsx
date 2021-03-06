import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const Row = styled.div<WithTheme>`
  display: flex;
  flex-shrink: 0;
  flex-basis: 0;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;

  > * + * {
    margin-left: 3px;
  }
`;
