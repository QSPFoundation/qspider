import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const Center = styled.div<WithTheme>`
  text-align: center;
  width: 100%;

  & > table {
    margin: 0 auto;
  }
`;
