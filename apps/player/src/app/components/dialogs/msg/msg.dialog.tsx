import React, { useState } from 'react';
import { Dialog, Button, Pane } from 'evergreen-ui';

export const MsgDialog: React.FC = ({ children }) => {
  const [isShown, setIsShown] = useState(false);
  return (
    <Pane>
      <Dialog
        isShown={isShown}
        title="Msg title"
        hasCancel={false}
        confirmLabel="OK"
        onCloseComplete={() => setIsShown(false)}
      >
        Msg content
        {children}
      </Dialog>

      <Button onClick={() => setIsShown(true)}>Show Msg</Button>
    </Pane>
  );
};
