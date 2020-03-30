import React, { useCallback } from 'react';
import { Dialog } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';

export const ErrorDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.clearError(), [gameManager]);
  const { errorData } = gameManager;
  const isShown = Boolean(errorData);
  return (
    <Dialog
      isShown={isShown}
      title="Error"
      hasCancel={false}
      confirmLabel="OK"
      onCloseComplete={onClose}
    >
      {errorData ? (
        <>
          Location: {errorData.location}
          <br />
          Line: {errorData.line}
          <br />
          Error code: {errorData.code}
          <br />
          Error: {errorData.description}
        </>
      ) : (
        ''
      )}
    </Dialog>
  );
});
