import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '@qspider/providers';
import { Modal } from '@qspider/components';

export const ErrorDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.clearError(), [gameManager]);
  const { errorData } = gameManager;
  if (!errorData) return null;
  return (
    <Modal onClose={onClose} dataQsp="error">
      <>
        Error: {errorData.description}
        <br />
        {errorData.code >= 0 ? 'Error code: ' + errorData.code : ''}
        <br />
        {errorData.location && 'Location: ' + errorData.location}
        <br />
        {errorData.actionIndex >= 0 ? 'Action index: ' + errorData.actionIndex : ''}
        <br />
        {errorData.line >= 0 ? 'Line: ' + errorData.line : ''}
      </>
    </Modal>
  );
});
