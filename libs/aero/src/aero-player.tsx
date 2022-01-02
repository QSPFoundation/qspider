import { PlayerToolbar, WaitLock } from '@qspider/player-ui';
import React from 'react';
import { Fill, Top, ViewPort } from 'react-spaces';
import { AeroLayoutProvider } from './aero-layout';
import { AeroLayoutContainer } from './aero-layout-container';
import { AeroMainFrame } from './aero-main-frame';

export const AeroPlayer: React.FC = () => {
  return (
    <AeroLayoutProvider>
      <AeroMainFrame>
        <ViewPort>
          <Top size={40}>
            <PlayerToolbar />
          </Top>
          <Fill scrollable={true}>
            <AeroLayoutContainer />
          </Fill>
        </ViewPort>
      </AeroMainFrame>
      <WaitLock />
    </AeroLayoutProvider>
  );
};
