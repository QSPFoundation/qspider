import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import styled from '@emotion/styled';
import { Modal } from '../../ui-blocks/modal';

const TextInput = styled.input`
  width: 100%;
  height: 40px;
`;

export const InputDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const [inputText, setInputText] = useState('');

  if (!manager.isInputShown) return null;
  return (
    <Modal onClose={() => manager.closeInput(inputText)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          manager.closeInput(inputText);
        }}
      >
        <TextInput
          autoFocus
          autoComplete="never"
          tabIndex={0}
          name="input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
      </form>
    </Modal>
  );
});
