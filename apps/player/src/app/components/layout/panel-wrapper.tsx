import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const PanelWrapper = styled.div<WithTheme & { size: number }>`
  max-width: 100%;
  max-height: 100%;
  flex-grow: ${(props) => props.size * 100};
  flex-shrink: 0;
  flex-basis: 0;
`;
