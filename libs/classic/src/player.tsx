import { ErrorDialog, SaveSlotsDialog, WaitLock } from '@qspider/player-ui';
import React from 'react';
import { LayoutProvider } from './classic-layout';
import { InputDialog } from './dialogs/input.dialog';
import { MsgDialog } from './dialogs/msg.dialog';
import { LayoutContainer } from './layout-container';
import { FloatingContainer } from './layout/floating';
import { MainFrame } from './main-frame';
import { Menu } from './menu';

export const ClassicPlayer: React.FC = () => {
  return (
    <LayoutProvider>
      <MainFrame>
        <LayoutContainer />
      </MainFrame>
      <FloatingContainer />
      <Menu />
      <MsgDialog />
      <InputDialog />
      <ErrorDialog />
      <SaveSlotsDialog />
      <WaitLock />
    </LayoutProvider>
  );
};
