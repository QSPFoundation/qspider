import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Modal } from '../../ui-blocks/modal';

export const ErrorDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.clearError(), [gameManager]);
  const { errorData } = gameManager;
  const isShown = Boolean(errorData);
  if (!isShown) return null;
  return (
    <Modal onClose={onClose} dataQsp="error">
      <>
        Location: {errorData.location}
        <br />
        Line: {errorData.line}
        <br />
        Error code: {errorData.code}
        <br />
        Error: {errorData.description}
      </>
    </Modal>
  );
});
