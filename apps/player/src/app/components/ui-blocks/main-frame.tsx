import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const MainFrame = styled.div<WithTheme>`
  width: 100vw;
  height: 100vh;
  background: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  font-size: ${(props) => props.theme.fontSize}pt;
  font-family: ${(props) => props.theme.fontName};
`;
