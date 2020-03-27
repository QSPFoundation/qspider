import React, { useState } from 'react';
import { Pane, Dialog, Button } from 'evergreen-ui';

export const ErrorDialog: React.FC = () => {
  const [isShown, setIsShown] = useState(false);
  return (
    <Pane>
      <Dialog
        isShown={isShown}
        title="Error"
        hasCancel={false}
        confirmLabel="OK"
        onCloseComplete={() => setIsShown(false)}
      >
        Location: 1<br />
        Line: 3<br />
        Error code: 119
        <br />
        Error: Unknown action
      </Dialog>

      <Button onClick={() => setIsShown(true)}>Show Error</Button>
    </Pane>
  );
};
