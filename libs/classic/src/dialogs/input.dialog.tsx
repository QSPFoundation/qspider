import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import { Modal, Content } from '@qspider/components';

const TextInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 2px 5px;
  background: var(--background-color);
  border: 1px solid var(--border-color);

  &:focus {
    outline: none;
    box-shadow: inset 0 0 5px 0px rgba(0, 0, 0, 0.75);
  }
`;

export const InputDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const [inputText, setInputText] = useState('');

  if (!manager.isInputShown) return null;
  return (
    <Modal
      onClose={(): void => {
        manager.closeInput(inputText);
        setInputText('');
      }}
      dataQsp="input"
      focusButton={false}
    >
      <form
        onSubmit={(e): void => {
          e.preventDefault();
          manager.closeInput(inputText);
          setInputText('');
        }}
      >
        <Content content={manager.input} />
        <TextInput
          autoFocus
          autoComplete="off"
          tabIndex={0}
          name="input"
          value={inputText}
          onChange={(e): void => {
            setInputText(e.target.value);
          }}
        />
      </form>
    </Modal>
  );
});
