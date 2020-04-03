import React, { useState } from 'react';
import { Dialog, TextInput, majorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';

export const InputDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const [inputText, setInputText] = useState('');

  return (
    <Dialog
      isShown={manager.isInputShown}
      title="Data Input"
      confirmLabel="OK"
      onCloseComplete={() => manager.closeInput(inputText)}
    >
      {({ close }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <TextInput
            autoFocus
            autoComplete="never"
            tabIndex={0}
            name="input"
            value={inputText}
            width="100%"
            height={majorScale(6)}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
          />
        </form>
      )}
    </Dialog>
  );
});
