import React from 'react';
import { Pane, TextInput, majorScale, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';
import { useGameManager } from '../../game/manager';

export const UserInputPanel: React.FC = observer(() => {
  const manager = useGameManager();
  // TODO background color not working
  const {
    isUserInputPanelVisible,
    backgroundColor: background,
    color,
  } = useLayout();
  if (!isUserInputPanelVisible) return null;
  return (
    <Pane gridArea="user-input" border="default" padding={minorScale(1)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          manager.submitUserInput();
        }}
      >
        <TextInput
          background={background}
          color={color}
          height={majorScale(5)}
          width="100%"
          value={manager.userInput}
          onChange={(e) => {
            manager.updateUserInput(e.target.value);
          }}
        ></TextInput>
      </form>
    </Pane>
  );
});
