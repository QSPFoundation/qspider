import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import Color from 'color';

export const Button = styled.button<WithTheme>`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.buttonBackground};
  color: ${(props) => props.theme.buttonColor};
  border-radius: 4px;
  font-size: ${(props) => props.theme.fontSize}pt;
  padding: 8px 16px;
  border: 1px solid ${(props) => Color(props.theme.buttonBackground).darken(0.2).hex()};
  /* background-image: linear-gradient(to bottom, #0788de, #116ab8); */
  background-image: linear-gradient(
    to bottom,
    ${(props) => Color(props.theme.buttonBackground).lighten(0.2).hex()},
    ${(props) => Color(props.theme.buttonBackground).darken(0.2).hex()}
  );
  box-shadow: inset 0 0 0 1px rgba(67, 90, 111, 0.3), inset 0 -1px 1px 0 rgba(67, 90, 111, 0.06);

  &:hover {
    background-image: linear-gradient(
      to bottom,
      ${(props) => Color(props.theme.buttonBackground).lighten(0.1).hex()},
      ${(props) => Color(props.theme.buttonBackground).darken(0.3).hex()}
    );
  }
`;
