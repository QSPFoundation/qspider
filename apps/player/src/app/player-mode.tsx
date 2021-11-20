import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import Color from 'color';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AeroPlayer } from '@qspider/aero';
import { ClassicPlayer } from '@qspider/classic';

export const PlayerStyles = styled.div`
  font-size: ${(props): number => props.theme.fontSize}px;
  --font-size: ${(props): number => props.theme.fontSize}px;
  font-family: ${(props): string => props.theme.fontName};
  --background-color: ${(props): string => props.theme.backgroundColor};
  --inverted-background-color: ${(props): string => Color(props.theme.backgroundColor).negate().hex()};
  --background-image: ${(props): string => props.theme.backgroundImage};
  color: ${(props): string => props.theme.textColor};
  --color: ${(props): string => props.theme.textColor};
  --inverted-color: ${(props): string => props.theme.backgroundColor};
  --link-color: ${(props): string => props.theme.linkColor};
  --border-color: ${(props): string => props.theme.borderColor};
  --inverted-border-color: ${(props): string => Color(props.theme.borderColor).negate().hex()};

  button {
    color: ${(props): string => props.theme.textColor};
    font-size: ${(props): number => props.theme.fontSize}px;
    font-family: ${(props): string => props.theme.fontName};
  }

  input {
    color: ${(props): string => props.theme.textColor};
    font-size: ${(props): number => props.theme.fontSize}px;
    font-family: ${(props): string => props.theme.fontName};
  }
`;

export const PlayerMode: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.currentGame) return null;
  return <PlayerStyles>{manager.currentGame.mode === 'aero' ? <AeroPlayer /> : <ClassicPlayer />}</PlayerStyles>;
});
