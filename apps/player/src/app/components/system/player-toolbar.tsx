import React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { IconButton } from '../ui-blocks/icon-button';
import { OpenGameButton } from '../ui-blocks/open-game-button';

export const PlayerToolbarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 26px;
`;

const Icons = styled.div`
  display: flex;

  & > button,
  & > div {
    margin-left: 5px;
  }
`;

export const PlayerToolbar: React.FC = observer(() => {
  const manager = useGameManager();
  return (
    <PlayerToolbarWrapper>
      <Title>{manager.currentGame.title}</Title>
      <Icons>
        <IconButton
          icon={manager.audioEngine.isMuted ? 'speakerOff' : 'speaker'}
          onClick={() => {
            if (manager.audioEngine.isMuted) {
              manager.audioEngine.unMute();
            } else {
              manager.audioEngine.mute();
            }
          }}
        />
        <IconButton icon="restart" onClick={() => manager.restart()} />
        <IconButton icon="save" onClick={() => manager.requestSave()} />
        <IconButton icon="load" onClick={() => manager.requestRestore()} />
        {manager.hasGameList ? <IconButton icon="list" onClick={() => manager.showGameList()} /> : null}
        <OpenGameButton onOpen={(game: ArrayBuffer, name: string) => manager.openGame(game, name)} />
      </Icons>
    </PlayerToolbarWrapper>
  );
});
