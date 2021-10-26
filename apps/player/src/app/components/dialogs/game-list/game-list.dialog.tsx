import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '../../../game/manager';
import { Modal } from '../../ui-blocks/modal';
import { OpenGameButton } from '../../ui-blocks/open-game-button';

const GameListWrapper = styled.div`
  --background-color: #e8eae3;
  color: #000;
  --inverted-background-color: #373833;
`;

const GameSlots = styled.div<{ even: boolean }>`
  padding: 16px;
  display: grid;
  grid-template-columns: ${(props) => (props.even ? '1fr 1fr' : '1fr 1fr 1fr')};
  column-gap: 16px;
  row-gap: 16px;
`;

const GameSlot = styled.div`
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 4px;
  white-space: pre-wrap;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: var(--inverted-background-color);
    color: var(--background-color);
  }

  &[data-mode='aero']::after {
    content: 'AeroQSP';
    position: absolute;
    top: 3px;
    right: 3px;
    padding: 2px 4px;
    background: crimson;
    color: white;
    font-size: 11px;
  }
`;

const GameTitle = styled.h3`
  margin: 0;
  text-align: center;
`;

const OpenButtonWrapper = styled.div`
  padding: 0 16px;
  display: flex;
  justify-content: flex-end;
`;

export const GameListDialog: React.FC<{ closable?: boolean }> = observer(({ closable }) => {
  const gameManager = useGameManager();
  const onClose = useCallback(() => gameManager.hideGameList(), [gameManager]);
  const { config, isGameListShown } = gameManager;
  const isShown = Boolean(isGameListShown);
  if (!isShown) return null;
  return (
    <GameListWrapper>
      <Modal closable={closable} onClose={onClose} hideButtons width={800} dataQsp="game-list">
        <OpenButtonWrapper>
          <OpenGameButton onOpen={(game: ArrayBuffer, name: string) => gameManager.openGame(game, name)} />
        </OpenButtonWrapper>
        <GameSlots even={!(config.game.length % 2)}>
          {config.game.map((game) => (
            <GameSlot
              key={game.id}
              onClick={() => gameManager.openGameDescriptor(game)}
              data-mode={game.mode}
              data-qsp="game-slot"
            >
              <GameTitle>{game.title}</GameTitle>
              {game.description && <p>{game.description}</p>}
            </GameSlot>
          ))}
        </GameSlots>
      </Modal>
    </GameListWrapper>
  );
});
