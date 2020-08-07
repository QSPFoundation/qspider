import React from 'react';
import { observer } from 'mobx-react-lite';
import { Panel } from '../../ui-blocks/panel';
import styled from '@emotion/styled';
import { WithTheme } from '../../../theme.types';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';

const TextInput = styled.input<WithTheme>`
  background: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  display: inline-block;
  height: 40px;
  width: 100%;
  border: 0;
`;

export const UserInputPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isUserInputPanelVisible } = useLayout();
  if (!isUserInputPanelVisible) return null;
  return (
    <Panel>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          manager.submitUserInput();
        }}
      >
        <TextInput
          value={manager.userInput}
          onChange={(e) => {
            manager.updateUserInput(e.target.value);
          }}
        ></TextInput>
      </form>
    </Panel>
  );
});
