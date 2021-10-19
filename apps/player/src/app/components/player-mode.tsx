import styled from '@emotion/styled';
import Color from 'color';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useGameManager } from '../game/manager';
import { AeroPlayer } from './aero/aero-player';
import { Player } from './player';

export const PlayerStyles = styled.div`
  font-size: ${(props) => props.theme.fontSize}px;
  --font-size: ${(props) => props.theme.fontSize}px;
  font-name: ${(props) => props.theme.fontName};
  --background-color: ${(props) => props.theme.backgroundColor};
  --inverted-background-color: ${(props) => Color(props.theme.backgroundColor).negate().hex()};
  --background-image: ${(props) => props.theme.backgroundImage};
  color: ${(props) => props.theme.textColor};
  --color: ${(props) => props.theme.textColor};
  --inverted-color: ${(props) => props.theme.backgroundColor};
  --link-color: ${(props) => props.theme.linkColor};
  --border-color: ${(props) => props.theme.borderColor};
  --inverted-border-color: ${(props) => Color(props.theme.borderColor).negate().hex()};

  button {
    color: ${(props) => props.theme.textColor};
    font-size: ${(props) => props.theme.fontSize}px;
    font-name: ${(props) => props.theme.fontName};
  }
`;

export const PlayerMode: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.currentGame) return null;
  return <PlayerStyles>{manager.currentGame.mode === 'aero' ? <AeroPlayer /> : <Player />}</PlayerStyles>;
});
