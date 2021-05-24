import styled from '@emotion/styled';

type PanelProps = { withPadding?: boolean };

export const Panel = styled.div<PanelProps>`
  width: 100%;
  height: 100%;
  border: 1px solid ${(props) => props.theme.borderColor};
  white-space: pre-wrap;
`;

export const PanelWithBackground = styled(Panel)<PanelProps>`
  background-image: ${(props) => props.theme.backgroundImage};
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
`;

export const PanelContent = styled.div<PanelProps>`
  padding: 8px;
`;
