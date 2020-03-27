import React, { useState } from 'react';
import { Pane, Dialog, Button, TextInput, majorScale } from 'evergreen-ui';

export const InputDialog: React.FC = () => {
  const [isShown, setIsShown] = useState(false);
  const [inputText, setInputText] = useState('');
  return (
    <Pane>
      <Dialog
        isShown={isShown}
        title="Input title"
        confirmLabel="OK"
        onCloseComplete={() => setIsShown(false)}
      >
        {({ close }) => (
          <form onSubmit={() => close()}>
            <TextInput
              autofocus
              tabindex={0}
              name="input"
              value={inputText}
              width="100%"
              height={majorScale(6)}
              onChange={(e) => setInputText(e.target.value)}
            />
          </form>
        )}
      </Dialog>

      <Button onClick={() => setIsShown(true)}>Show Input</Button>
    </Pane>
  );
};
