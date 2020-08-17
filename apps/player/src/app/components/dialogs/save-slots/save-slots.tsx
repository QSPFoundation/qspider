import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Modal } from '../../ui-blocks/modal';
import styled from '@emotion/styled';

const SlotButton = styled.button``;

export const SaveSlotsDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.clearSaveAction(), [gameManager]);
  const { saveAction } = gameManager;
  const isShown = Boolean(saveAction);
  if (!isShown) return null;
  return (
    <Modal onClose={onClose}>
      <h4>{saveAction.type === 'save' ? 'Save' : 'Load'} game</h4>
      {saveAction.slots.map((date, index) => (
        <SlotButton
          key={index}
          disabled={saveAction.type === 'restore' && !date}
          onClick={() => saveAction.callback(index + 1)}
        >
          <strong>{index + 1}</strong> {date || '(empty)'}
        </SlotButton>
      ))}
    </Modal>
  );
});
