import styled from '@emotion/styled';
import Color from 'color';

export const Button = styled.button`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  border-radius: 4px;
  font-size: ${(props) => props.theme.fontSize}pt;
  padding: 4px 16px;
  border: 1px solid ${(props) => props.theme.borderColor};

  &:hover {
    background-color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
    color: ${(props) => Color(props.theme.textColor).negate().hex()};
    border-color: ${(props) => Color(props.theme.borderColor).negate().hex()};
  }
  &:focus {
    outline: none;
  }
`;
