import React, { Fragment } from 'react';
import { MainFrame } from './ui-blocks/main-frame';
import { StatsPanel } from './panels/stats/stats';
import { MainPanel } from './panels/main/main';
import { ObjectsPanel } from './panels/objects/objects';
import { ActionsPanel } from './panels/actions/actions';
import { WaitLock } from './system/wait-lock';
import { Menu } from './system/menu';
import { UserInputPanel } from './panels/user-input/user-input';
import { ViewImagePanel } from './panels/view-image/view-image.panel';
import { MsgDialog } from './dialogs/msg/msg.dialog';
import { InputDialog } from './dialogs/input/input.dialog';
import { ErrorDialog } from './dialogs/error/error.dialog';

export const Player: React.FC = () => {
  return (
    <Fragment>
      <MainFrame>
        <MainPanel />
        <ObjectsPanel />
        <ActionsPanel />
        <StatsPanel />
        <UserInputPanel />
      </MainFrame>
      <Menu />
      <ViewImagePanel />
      <MsgDialog />
      <InputDialog />
      <ErrorDialog />
      <WaitLock />
    </Fragment>
  );
};
