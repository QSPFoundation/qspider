import styled from '@emotion/styled';

export const Button = styled.button`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  background-color: var(--background-color);
  border-radius: 4px;
  padding: 4px 16px;
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--inverted-border-color);
    color: var(--inverted-color);
    border-color: var(--inverted-border-color);
  }
  &:focus {
    outline: none;
  }
`;
