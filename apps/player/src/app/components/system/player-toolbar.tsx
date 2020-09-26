import React from 'react';
import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { IconButton } from '../ui-blocks/icon-button';

export const PlayerToolbarWrapper = styled.div<WithTheme>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 26px;
`;

const Icons = styled.div`
  display: flex;

  button + button {
    margin-left: 5px;
  }
`;

export const PlayerToolbar: React.FC = observer(() => {
  const manager = useGameManager();
  return (
    <PlayerToolbarWrapper>
      <Title>{manager.descriptor.title}</Title>
      <Icons>
        <IconButton icon="restart" onClick={() => manager.restart()} />
        <IconButton icon="save" onClick={() => manager.requestSave()} />
        <IconButton icon="load" onClick={() => manager.requestRestore()} />
        {/* <IconButton icon="speaker" onClick={() => {}} />
        <IconButton icon="speakerOff" onClick={() => {}} /> */}
      </Icons>
    </PlayerToolbarWrapper>
  );
});
