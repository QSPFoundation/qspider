import React, { ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { Icon } from './icons';
import Color from 'color';

const OpenButton = styled.div`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  position: relative;
  border-radius: 4px;

  background-color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
  color: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => Color(props.theme.borderColor).negate().hex()};

  padding: 0;
  margin: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;

  &:hover {
    background-color: ${(props) => props.theme.backgroundColor};
    color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
    border-color: ${(props) => props.theme.borderColor};
  }
  &:focus {
    outline: none;
  }
`;
const FileInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
const FileInputLabel = styled.label`
  cursor: pointer;
`;

export const OpenGameButton: React.FC<{ onOpen: (file: ArrayBuffer, name: string) => void }> = ({ onOpen }) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (evt) {
      onOpen(evt.target.result as ArrayBuffer, file.name);
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <OpenButton>
      <FileInput type="file" id="openGame" accept=".zip" onChange={onChange} />
      <FileInputLabel htmlFor="openGame">
        <Icon icon="open" />
      </FileInputLabel>
    </OpenButton>
  );
};
