import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const PanelWrapper = styled.div<WithTheme & { size: number }>`
  flex-grow: ${(props) => props.size * 100};
  flex-shrink: 0;
  flex-basis: 0;
`;
