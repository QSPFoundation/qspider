import React from 'react';
import { Pane } from 'evergreen-ui';

import { MainPanel } from '../components/main/main.panel';
import { ActionsPanel } from '../components/actions/actions.panel';
import { ObjectsPanel } from '../components/objects/objects.panel';
import { StatsPanel } from '../components/stats/stats.panel';
import { UserInputPanel } from '../components/user-input/user-input.panel';
import { ActionItem } from '../components/actions/action.item';
import { ObjectItem } from '../components/objects/object.item';
import { MsgDialog } from '../components/dialogs/msg/msg.dialog';
import { InputDialog } from '../components/dialogs/input/input.dialog';
import { ErrorDialog } from '../components/dialogs/error/error.dialog';

export function Player() {
  return (
    <>
      <Pane
        width="100vw"
        height="100vh"
        display="grid"
        gridGap="8px"
        gridTemplateRows="1fr 300px 50px"
        gridTemplateColumns="1fr 150px 300px"
        gridTemplateAreas={`"main main objects"
         "actions stats stats"
         "user-input user-input user-input"`}
      >
        <MainPanel>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum
          <br />
          <MsgDialog></MsgDialog>
          <InputDialog></InputDialog>
          <ErrorDialog></ErrorDialog>
        </MainPanel>
        <ActionsPanel>
          <ActionItem>Action 1</ActionItem>
          <ActionItem>Action 2</ActionItem>
          <ActionItem>Action 3</ActionItem>
        </ActionsPanel>
        <ObjectsPanel>
          <ObjectItem>Object 1</ObjectItem>
          <ObjectItem>Object 2</ObjectItem>
          <ObjectItem>Object 3</ObjectItem>
          <ObjectItem>Object 4</ObjectItem>
        </ObjectsPanel>
        <StatsPanel>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum
        </StatsPanel>
        <UserInputPanel></UserInputPanel>
      </Pane>
    </>
  );
}
