import styled from '@emotion/styled';

export const FileDropArea = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  font-family: sans-serif;
  text-align: center;

  z-index: 10000;

  background-color: #c8dadf;

  outline: 2px dashed #92b0b3;
  outline-offset: -10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 48px;

  transition: outline-offset 0.15s ease-in-out, background-color 0.15s linear;

  &.disabled {
    background-color: brown;
    color: white;
    cursor: no-drop;
  }
`;
