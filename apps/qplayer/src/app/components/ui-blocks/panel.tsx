import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

type PanelProps = { gridArea: string; withPadding?: boolean } & WithTheme;

export const Panel = styled.div<PanelProps>`
  grid-area: ${(props) => props.gridArea};
  border: 1px solid ${(props) => props.theme.borderColor};
  padding: ${(props) => (props.withPadding ? `8px` : 0)};
`;

export const PanelWithBackground = styled(Panel)<PanelProps>`
  background-image: ${(props) => props.theme.backgroundImage};
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
`;
