import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const Column = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  * + * {
    margin-top: 3px;
  }
`;
