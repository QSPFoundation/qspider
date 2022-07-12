import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { Icon, IconType } from '@qspider/icons';
import { useGameManager } from '@qspider/providers';
import { dialog } from '@tauri-apps/api';
import { openGameFromDisk } from './utils';

const OpenButton = styled.div`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  position: relative;
  border-radius: 4px;

  background-color: var(--inverted-background-color);
  color: var(--background-color);
  border: 1px solid var(--inverted-background-color);

  padding: 0;
  margin: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;

  &:hover {
    background-color: var(--background-color);
    color: var(--inverted-background-color);
    border: 1px solid var(--inverted-background-color);
  }
  &:focus {
    outline: none;
  }
`;

export const OpenGameButton: React.FC = () => {
  const gameManager = useGameManager();
  const selectGame = useCallback(async () => {
    const file_path = await dialog.open({
      filters: [
        {
          name: 'Qsp files',
          extensions: ['qsp', 'qsps', 'aqsp', 'zip'],
        },
      ],
    });
    if (file_path) {
      openGameFromDisk(file_path as string, gameManager);
    }
  }, [gameManager]);
  return (
    <OpenButton onClick={selectGame}>
      <Icon icon={IconType.open} />
    </OpenButton>
  );
};
