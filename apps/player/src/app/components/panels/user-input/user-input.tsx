import React from 'react';
import { observer } from 'mobx-react-lite';
import { Panel } from '../../ui-blocks/panel';
import styled from '@emotion/styled';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';

const TextInput = styled.input`
  background: var(--background-color);
  display: inline-block;
  height: 100%;
  width: 100%;
  border: 0;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 5px 0px rgba(0, 0, 0, 0.75);
  }
`;
const Form = styled.form`
  display: inline-block;
  height: 100%;
  width: 100%;
`;

export const UserInputPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isUserInputPanelVisible } = useLayout();
  if (!isUserInputPanelVisible) return null;
  return (
    <Panel data-qsp="user-input">
      <Form
        onSubmit={(e): void => {
          e.preventDefault();
          manager.submitUserInput();
        }}
      >
        <TextInput
          value={manager.userInput}
          onChange={(e): void => {
            manager.updateUserInput(e.target.value);
          }}
        ></TextInput>
      </Form>
    </Panel>
  );
});
