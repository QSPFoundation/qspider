import React from 'react';
import { Pane, TextInput, majorScale, minorScale } from 'evergreen-ui';

export const UserInputPanel: React.FC = () => {
  return (
    <Pane gridArea="user-input" border="default" padding={minorScale(1)}>
      <TextInput height={majorScale(5)} width="100%"></TextInput>
    </Pane>
  );
};
