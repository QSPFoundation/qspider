import React from 'react';
import { Pane, TextInput, majorScale, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';

export const UserInputPanel: React.FC = observer(() => {
  const { isUserInputPanelVisible } = useLayout();
  if (!isUserInputPanelVisible) return null;
  return (
    <Pane gridArea="user-input" border="default" padding={minorScale(1)}>
      <TextInput height={majorScale(5)} width="100%"></TextInput>
    </Pane>
  );
});
