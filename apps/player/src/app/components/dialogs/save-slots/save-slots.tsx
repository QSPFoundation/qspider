import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from '../../../game/manager';
import { Modal } from '../../ui-blocks/modal';
import styled from '@emotion/styled';
import { WithTheme } from '../../../theme.types';

const SlotTtile = styled.h4`
  margin: 0;
  text-align: center;
`;
const SlotButton = styled.button<WithTheme>`
  text-align: center;
  cursor: pointer;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  border: 2px solid ${(props) => props.theme.borderColor};
  padding: 4px 8px;
  border-radius: 8px;
`;
const Slots = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 16px;
  row-gap: 16px;
`;

export const SaveSlotsDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.clearSaveAction(), [gameManager]);
  const { saveAction } = gameManager;
  const isShown = Boolean(saveAction);
  if (!isShown) return null;
  return (
    <Modal hideButtons onClose={onClose}>
      <SlotTtile>{saveAction.type === 'save' ? 'Save' : 'Load'} game</SlotTtile>
      <Slots>
        {saveAction.slots.map((date, index) => (
          <SlotButton
            key={index}
            disabled={saveAction.type === 'restore' && !date}
            onClick={() => saveAction.callback(index + 1)}
          >
            <strong>{index + 1}</strong>
            <br />
            {date ? new Intl.DateTimeFormat().format(new Date(date)) : '(empty)'}
          </SlotButton>
        ))}
      </Slots>
    </Modal>
  );
});
