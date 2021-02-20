import React from 'react';
import { MainFrame } from '../ui-blocks/main-frame';
import { WaitLock } from '../system/wait-lock';
import { Fill, Top, ViewPort } from 'react-spaces';
import { PlayerToolbar } from '../system/player-toolbar';
import { AeroLayoutProvider } from '../../game/aero/aero-layout';
import { AeroLayoutContainer } from './aero-layout-container';

export const AeroPlayer: React.FC = () => {
  return (
    <AeroLayoutProvider>
      <MainFrame>
        <ViewPort>
          <Top size={40}>
            <PlayerToolbar />
          </Top>
          <Fill scrollable={true}>
            <AeroLayoutContainer />
          </Fill>
        </ViewPort>
      </MainFrame>
      <WaitLock />
    </AeroLayoutProvider>
  );
};
