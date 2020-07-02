import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';

export const MainFrame = styled.div<WithTheme>`
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-gap: 4px;
  grid-template-rows: 1fr 300px 42px;
  grid-template-columns: 1fr 150px 300px;
  grid-template-areas: ${(props) => props.theme.templateAreas};
  background: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  font-size: ${(props) => props.theme.fontSize}px;
  font-family: ${(props) => props.theme.fontName};
`;
