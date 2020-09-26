import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const Column = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-basis: 0;
  width: 100%;
  height: 100%;

  & > * + * {
    margin-top: 3px;
  }
`;
