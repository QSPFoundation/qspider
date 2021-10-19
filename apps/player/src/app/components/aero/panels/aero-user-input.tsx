import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { AeroContentRectangle } from '@qspider/qsp-wasm';

const TextInput = styled.input<AeroContentRectangle>`
  background: transparent;
  color: ${(props) => props.theme.textColor};
  display: inline-block;
  position: absolute;
  top: ${(props) => props.y || 0}px;
  left: ${(props) => props.x || 0}px;
  height: ${(props) => props.height || 0}px;
  width: ${(props) => props.width || 0}px;
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
  const { isUserInputPanelVisible } = useLayout();
  if (!isUserInputPanelVisible || !userInputUI) return null;
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        manager.submitUserInput();
      }}
    >
      <TextInput
        value={manager.userInput}
        {...userInputUI}
        onChange={(e) => {
          manager.updateUserInput(e.target.value);
        }}
      ></TextInput>
    </Form>
  );
});
