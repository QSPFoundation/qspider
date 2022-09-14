import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { useAeroLayout } from '../aero-layout';
import { AeroContentRectangle } from '../aero.types';

const TextInput = styled.input<AeroContentRectangle>`
  background: transparent;
  display: inline-block;
  position: absolute;
  top: ${(props): number => props.y || 0}px;
  left: ${(props): number => props.x || 0}px;
  height: ${(props): number => props.height || 0}px;
  width: ${(props): number => props.width || 0}px;
  border: none;

  &:focus {
    outline: none;
  }
`;
const Form = styled.form`
  display: inline-block;
  height: 100%;
  width: 100%;
`;

export const AeroUserInputPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { userInputUI } = useAeroLayout();
  const { isUserInputPanelVisible } = useBaseLayout();
  if (!isUserInputPanelVisible || !userInputUI) return null;
  return (
    <Form
      onSubmit={(e): void => {
        e.preventDefault();
        manager.submitUserInput();
      }}
    >
      <TextInput
        value={manager.userInput}
        {...userInputUI}
        onChange={(e): void => {
          manager.updateUserInput(e.target.value);
        }}
      ></TextInput>
    </Form>
  );
});
